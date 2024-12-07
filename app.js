// นำเข้าไลบรารีที่จำเป็น
var createError = require('http-errors'); // ใช้สำหรับสร้างข้อผิดพลาด HTTP
var express = require('express'); // นำเข้าเฟรมเวิร์ก Express.js
var path = require('path'); // ใช้สำหรับจัดการเส้นทาง (path) ในระบบไฟล์
var cookieParser = require('cookie-parser'); // Middleware สำหรับการจัดการคุกกี้
var logger = require('morgan'); // Middleware สำหรับการบันทึกการเข้าถึง HTTP
const mongoose = require('mongoose'); // ไลบรารีสำหรับการเชื่อมต่อกับ MongoDB
const expressSession = require('express-session'); // Middleware สำหรับการจัดการเซสชันใน Express.js
const flash = require('connect-flash'); // Middleware สำหรับการจัดการ flash messages

// นำเข้าโมเดลและเส้นทางที่จำเป็น
const Stock = require('./models/stocks'); // นำเข้าโมเดล Stock
const apiRouter = require('./routes/apiRoutes'); // นำเข้าเส้นทาง API
const indexRouter = require('./routes/indexRoutes'); // นำเข้าเส้นทางหน้าแรก
const loginRouter = require('./routes/loginRoutes'); // นำเข้าเส้นทางสำหรับเข้าสู่ระบบ
const registerRouter = require('./routes/registerRoutes'); // นำเข้าเส้นทางสำหรับลงทะเบียน
const userRouter = require('./routes/userRoutes'); // นำเข้าเส้นทางสำหรับจัดการผู้ใช้
const logoutRouter = require('./routes/logoutRoutes'); // นำเข้าเส้นทางสำหรับออกจากระบบ
const homeRouter = require('./routes/homeRoutes'); // นำเข้าเส้นทางสำหรับหน้าแรกหลังจากเข้าสู่ระบบ
const stockRouter = require('./routes/stockRoutes'); // นำเข้าเส้นทางสำหรับจัดการหุ้น
const investRouter = require('./routes/investRoutes'); // นำเข้าเส้นทางสำหรับการลงทุน
const user_stockRouter = require('./routes/user_stockRoutes'); // นำเข้าเส้นทางสำหรับจัดการหุ้นของผู้ใช้
const transactionRouter = require('./routes/transactionRoutes'); // นำเข้าเส้นทางสำหรับการทำธุรกรรม

// นำเข้า middleware ที่กำหนดเอง
const redirectIfAuth = require('./middleware/redirectIfAuth'); // Middleware สำหรับการเปลี่ยนเส้นทางหากผู้ใช้เข้าสู่ระบบแล้ว
const authMiddleware = require('./middleware/authMiddleware'); // Middleware สำหรับตรวจสอบการเข้าสู่ระบบ

// นำเข้าฟังก์ชันบริการที่กำหนดเอง
const { updateStockPrice } = require('./services/stockService'); // นำเข้าฟังก์ชันสำหรับอัปเดตราคาหุ้น

// ฟังก์ชันสำหรับดึงข้อมูลหุ้นทั้งหมดจาก MongoDB เพื่อทำการอัปเดตราคา
const updateAllStockPrices = async () => {
    try {
        const stocks = await Stock.find(); // ดึงข้อมูลหุ้นทั้งหมดจากฐานข้อมูล
        stocks.forEach(stock => {
            updateStockPrice(stock.symbol); // อัปเดตราคาหุ้นตามสัญลักษณ์ของหุ้น
        });
    } catch (error) {
        console.error('Error updating stock prices:', error); // แสดงข้อผิดพลาดหากมีปัญหา
    }
};

// เชื่อมต่อกับ MongoDB
const dbURI = 'mongodb://localhost:27017/Project'; // URI สำหรับเชื่อมต่อกับ MongoDB

mongoose.connect(dbURI) // เชื่อมต่อกับ MongoDB
.then(() => {
    console.log('Connected to MongoDB'); // แสดงข้อความเมื่อเชื่อมต่อสำเร็จ
    // เริ่มการอัปเดตราคาเมื่อเชื่อมต่อสำเร็จ
    setInterval(updateAllStockPrices, 60000); // อัปเดตราคาในทุกๆ 1 นาที
})
.catch((err) => console.log(err)); // แสดงข้อผิดพลาดหากไม่สามารถเชื่อมต่อได้

var app = express(); // สร้างแอปพลิเคชัน Express

global.loggedIn = null; // กำหนดตัวแปร global สำหรับจัดเก็บสถานะการเข้าสู่ระบบ

// ตั้งค่า view engine
app.set('views', path.join(__dirname, 'views')); // กำหนดตำแหน่งที่เก็บไฟล์ views
app.set('view engine', 'ejs'); // กำหนดให้ใช้ EJS เป็น template engine

// ใช้งาน middleware ต่างๆ
app.use(logger('dev')); // ใช้งาน middleware สำหรับบันทึกการเข้าถึง
app.use(express.json()); // ใช้งาน middleware สำหรับการรับข้อมูล JSON
app.use(express.urlencoded({ extended: true })); // ใช้งาน middleware สำหรับการรับข้อมูลจากแบบฟอร์ม
app.use(cookieParser()); // ใช้งาน cookie parser middleware
app.use(express.static(path.join(__dirname, 'public'))); // กำหนดเส้นทางสำหรับไฟล์ static
app.use(flash()); // ใช้งาน middleware สำหรับ flash messages
app.use(expressSession({
    secret: "node secret", // คีย์ลับสำหรับการเข้ารหัส session
    resave: false, // ตั้งค่าให้บันทึกเฉพาะเมื่อมีการเปลี่ยนแปลง
    saveUninitialized: false, // ไม่บันทึก session ที่ไม่มีข้อมูล
}));
app.use("*", (req, res, next) => {
    loggedIn = req.session.userId; // เก็บ userId ในตัวแปร global
    next(); // ไปยัง middleware ถัดไป
});

// กำหนดเส้นทางต่างๆ
app.use('/api', apiRouter); // กำหนดเส้นทาง API
app.use('/', indexRouter); // กำหนดเส้นทางหน้าแรก
app.use('/home', authMiddleware, homeRouter); // กำหนดเส้นทางหน้าแรกหลังจากเข้าสู่ระบบ โดยมีการตรวจสอบการเข้าสู่ระบบ
app.use('/login', redirectIfAuth, loginRouter); // กำหนดเส้นทางเข้าสู่ระบบ โดยมีการเปลี่ยนเส้นทางหากเข้าสู่ระบบแล้ว
app.use('/register', redirectIfAuth, registerRouter); // กำหนดเส้นทางลงทะเบียน โดยมีการเปลี่ยนเส้นทางหากเข้าสู่ระบบแล้ว
app.use('/user', userRouter); // กำหนดเส้นทางสำหรับจัดการผู้ใช้
app.use('/logout', logoutRouter); // กำหนดเส้นทางสำหรับออกจากระบบ
app.use('/stock', stockRouter); // กำหนดเส้นทางสำหรับจัดการหุ้น
app.use('/invest', investRouter); // กำหนดเส้นทางสำหรับการลงทุน
app.use('/user_stock', user_stockRouter); // กำหนดเส้นทางสำหรับจัดการหุ้นของผู้ใช้
app.use('/transaction', transactionRouter); // กำหนดเส้นทางสำหรับการทำธุรกรรม

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404)); // สร้างข้อผิดพลาด 404 หากไม่พบเส้นทาง
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message; // กำหนดข้อความข้อผิดพลาด
    res.locals.error = req.app.get('env') === 'development' ? err : {}; // กำหนดข้อมูลข้อผิดพลาดสำหรับสภาพแวดล้อมการพัฒนา

    // render the error page
    res.status(err.status || 500); // กำหนดสถานะ HTTP
    res.render('error'); // เรนเดอร์หน้าแสดงข้อผิดพลาด
});

// ส่งออกแอปพลิเคชัน
module.exports = app;