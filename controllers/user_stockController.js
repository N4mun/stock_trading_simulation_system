const UserStock = require("../models/user_stocks");
const User = require('../models/user');
const Stock = require('../models/stocks');
const Transaction = require("../models/transactions");

// ฟังก์ชันการดึงข้อมูลการถือครองหุ้น ใน userStocks เพื่อนำมาแสดง
const user_stock = async (req, res) => {
    try {
        const userId = req.session.userId; 
        // ดึงข้อมูล UserStock พร้อมกับข้อมูลที่เชื่อมโยง
        const userStocks = await UserStock.find({ user_id: userId })
            .populate('stock_id') // ดึงข้อมูลจาก Stock
            .populate('user_id'); // ดึงข้อมูลจาก User (ถ้าจำเป็น)

        // ดึงข้อมูลยอดคงเหลือของผู้ใช้งาน
        const user = await User.findById(userId);
        const userBalance = user.balance; // สมมติว่าผู้ใช้งานมีฟิลด์ 'balance'

        // ส่งข้อมูลไปยัง EJS
        res.render('user_stock', { userStocks, userBalance });
    } catch (error) {
        console.error(error);
        res.render('user_stock', { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหุ้น' });
    }
};


// ฟังก์ชันการขายหุ้น
const sell_stock = async (req, res) => {
    const { quantity: quantityString } = req.body;
    const quantity = parseInt(quantityString, 10);
    const userStockId = req.params._id; // รับ _id ของ UserStock จาก URL
    const userId = req.session.userId; // ดึง userId จาก session

    if (quantity < 1) {
        return res.status(400).send("ต้องขายขั้นต่ำ 1 หุ้น");
    }

    try {
        // ดึงข้อมูลหุ้นที่ผู้ใช้งานมีอยู่
        const userStock = await UserStock.findById(userStockId).populate('stock_id');
        
        if (!userStock) {
            return res.status(404).send("ไม่พบหุ้นที่คุณมี");
        }

        // ตรวจสอบว่าผู้ใช้งานมีจำนวนหุ้นเพียงพอที่จะขายหรือไม่
        if (userStock.quantity < quantity) {
            return res.status(400).send("จำนวนหุ้นที่คุณมีไม่เพียงพอที่จะขาย");
        }

        // คำนวณมูลค่าการขาย
        const sellPrice = userStock.stock_id.price * quantity;
        
        // อัปเดตจำนวนหุ้นของผู้ใช้งาน
        userStock.quantity -= quantity;

        // ถ้าขายหมดให้ลบหุ้นออกจากคลังผู้ใช้งาน
        if (userStock.quantity === 0) {
            await UserStock.findByIdAndDelete(userStockId);
        } else {
            await userStock.save(); // บันทึกข้อมูลหุ้นใหม่หลังจากการขาย
        }

        await User.updateOne(
            { _id: userId }, // ค้นหาผู้ใช้งานด้วย userId
            { $inc: { balance: sellPrice } } // อัปเดตยอดเงินโดยเพิ่ม sellPrice
        );

        // บันทึกข้อมูลการทำธุรกรรม
        const transaction = new Transaction({
            user_id: userId,
            stock_id: userStock.stock_id._id,
            quantity: -quantity, // ใช้ค่าเชิงลบแสดงถึงการขาย
            price: sellPrice,
            transaction_type: 'SELL' // แสดงว่าทำรายการขาย
        });
        await transaction.save();

        res.redirect('/user_stock'); // กลับไปยังหน้ารายการหุ้นหลังจากทำรายการสำเร็จ

    } catch (error) {
        console.error(error);
        res.status(500).send("เกิดข้อผิดพลาดในการขายหุ้น");
    }
};


module.exports = {
    user_stock,
    sell_stock
}
