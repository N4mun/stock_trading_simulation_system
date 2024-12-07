const User = require('../models/user'); // นำเข้าโมเดล User สำหรับจัดการข้อมูลผู้ใช้ในฐานข้อมูล
const Stock = require("../models/stocks"); // นำเข้าโมเดล Stock สำหรับจัดการข้อมูลหุ้น
const UserStock = require("../models/user_stocks"); // นำเข้าโมเดล UserStock สำหรับจัดการข้อมูลหุ้นที่ผู้ใช้ถือครอง
const Transaction = require("../models/transactions"); // นำเข้าโมเดล Transaction สำหรับจัดการข้อมูลการทำธุรกรรม
const { redirect } = require('express/lib/response'); // นำเข้า redirect สำหรับใช้ในการเปลี่ยนเส้นทาง


// ฟังก์ชันนี้ใช้ในการแสดงหน้า invest โดยไม่ต้องมีข้อมูลใด ๆ ส่งไปยัง template
const invest = (req, res) => {
    res.render('invest');
};

// ฟังก์ชันนี้ใช้ในการดึงข้อมูลหุ้นที่ต้องการลงทุน และแสดงหน้ารายละเอียดของหุ้นนั้น
const invest_stock = async (req, res) => {
    let UserData = await User.findById(req.session.userId)
    const _id = req.params._id;
    Stock.findOne({ _id: _id })
        .then(result => {
            res.render('invest_stock', { stock: result, user: UserData}); // ส่ง user ID ไปยัง template
        })
        .catch(err => {
            console.log(err);
        });
};

// ฟังก์ชันนี้ทำหน้าที่ค้นหาข้อมูลหุ้นจากฐานข้อมูล
const stock_info = async (req, res) => {
    try {
        let { query } = req.query; // รับค่าค้นหาจาก query string
        let StockData;

        if (query) {
            // ถ้ามีคำค้นหาให้กรองข้อมูลหุ้นตามคำค้น
            StockData = await Stock.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } }, // ค้นหาชื่อหุ้น
                    { symbol: { $regex: query, $options: 'i' } } // ค้นหาสัญลักษณ์หุ้น
                ]
            });
        } else {
            // ถ้าไม่มีคำค้นหาให้ดึงข้อมูลหุ้นทั้งหมด
            StockData = await Stock.find();
        }

        res.render('invest', { stocks: StockData }); // ส่งข้อมูลไปยัง view 'invest'
    } catch (err) {
        console.log(err);
        res.status(500).send('Error retrieving stock data');
    }
};

// ฟังก์ชันนี้ทำหน้าที่รับคำขอซื้อหุ้นจากผู้ใช้
const buy_stock = async (req, res) => {
    const { stockId, quantity: quantityString } = req.body;
    const quantity = parseInt(quantityString, 10);

    const userId = req.session.userId;

    if (quantity < 1) {
        return res.status(400).send("ต้องซื้อขั้นต่ำ 1 หุ้น");
    }

    try {
        const user = await User.findById(userId);
        const stock = await Stock.findById(stockId);

        // คำนวณราคาทั้งหมด
        const totalPrice = stock.price * quantity;

        if (user.balance < totalPrice) {
            return res.status(400).send("ยอดเงินไม่เพียงพอสำหรับการซื้อหุ้น");
        }

        // ตรวจสอบว่าผู้ใช้มีหุ้นตัวนี้อยู่ใน UserStock หรือไม่
        let userStock = await UserStock.findOne({ user_id: userId, stock_id: stockId });

        if (userStock) {
            // ถ้ามีหุ้นอยู่แล้ว ให้เพิ่มจำนวนหุ้น
            userStock.quantity += quantity;
            // คำนวณราคาต่อหุ้นใหม่
            const avgPrice = (userStock.price * userStock.quantity + stock.price * quantity) / (userStock.quantity + quantity);
            userStock.price = avgPrice; // ปรับราคาเฉลี่ย
            await userStock.save(); // บันทึกข้อมูลที่อัปเดต
        } else {
            // ถ้ายังไม่มีหุ้นในฐานข้อมูล ให้สร้างใหม่
            userStock = new UserStock({
                user_id: userId,
                stock_id: stockId,
                price: stock.price,
                quantity: quantity
            });
            await userStock.save(); // บันทึกข้อมูลหุ้นที่ซื้อใหม่
        }

        await User.updateOne({ _id: userId }, { $inc: { balance: -totalPrice } }); // อัปเดตยอดเงินในฐานข้อมูล

        // บันทึกการทำธุรกรรม
        const transactionRecord = new Transaction({
            user_id: userId,
            stock_id: stockId,
            transaction_type: 'BUY',
            quantity: quantity,
            price: stock.price
        });
        await transactionRecord.save();

        res.redirect('/invest');
    } catch (error) {
        console.error(error);
        return res.status(500).send("เกิดข้อผิดพลาด");
    }
};


module.exports = {
    invest,
    invest_stock,
    stock_info,
    buy_stock
};
