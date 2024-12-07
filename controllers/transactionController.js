const Transaction = require("../models/transactions");
const User = require("../models/user");

const transaction = async (req, res) => {
    try {
        const userId = req.session.userId; // ดึง userId จาก session ของผู้ใช้ที่ล็อกอิน

        // ดึงข้อมูลประวัติการทำธุรกรรมของผู้ใช้
        const userTransactions = await Transaction.find({ user_id: userId }).populate('stock_id');
        
        // ถ้าไม่มีธุรกรรม ให้ส่ง message และ empty transactions array
        if (!userTransactions || userTransactions.length === 0) {
            return res.render('transaction', { transactions: [], message: 'ไม่มีประวัติการซื้อขาย' });
        }

        // ส่งประวัติการทำธุรกรรมไปยังหน้า EJS
        res.render('transaction', { transactions: userTransactions });
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงประวัติการซื้อขาย');
    }
};


module.exports = {
    transaction
};
