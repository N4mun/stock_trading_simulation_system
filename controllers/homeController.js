// นำเข้ามอดูล User สำหรับการจัดการข้อมูลผู้ใช้
const User = require('../models/user'); 

// นำเข้ามอดูล Stock สำหรับการจัดการข้อมูลหุ้น
const Stock = require("../models/stocks");

// ฟังก์ชัน home เพื่อแสดงหน้าหลัก
const home = async (req, res) => {
    try {
        // ค้นหาข้อมูลผู้ใช้ตาม userId ที่เก็บไว้ใน session
        let UserData = await User.findById(req.session.userId);
        
        // ดึงข้อมูลหุ้นทั้งหมดจากฐานข้อมูล
        let StockData = await Stock.find(); 

        // เรนเดอร์ view 'home' และส่งข้อมูลหุ้นและข้อมูลผู้ใช้ไป
        res.render('home', { 
            stocks: StockData, // ข้อมูลหุ้น
            users: UserData // ข้อมูลผู้ใช้
        }); 
    } catch (err) {
        console.log(err); // แสดงข้อผิดพลาดใน console
        res.status(500).send('Error retrieving stock data'); // ส่งข้อความข้อผิดพลาด
    }
};

// ส่งออกฟังก์ชัน home เพื่อให้สามารถใช้งานได้ใน router
module.exports = {
    home
}