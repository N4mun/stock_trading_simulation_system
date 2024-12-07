// นำเข้ามอดูลที่จำเป็น
const User = require('../models/user'); // โมเดลสำหรับผู้ใช้
const Stock = require('../models/stocks'); // โมเดลสำหรับหุ้น
const UserStock = require('../models/user_stocks'); // โมเดลสำหรับความสัมพันธ์ผู้ใช้กับหุ้น
const Transaction = require('../models/transactions'); // โมเดลสำหรับการทำธุรกรรม
const axios = require('axios'); // ไลบรารีสำหรับทำ HTTP requests
const bcrypt = require('bcrypt'); // ไลบรารีสำหรับเข้ารหัสรหัสผ่าน

// กำหนด API Key สำหรับการเข้าถึงข้อมูลจาก Finnhub.io
const apiKey = 'cs001b9r01qrbtrl5j70cs001b9r01qrbtrl5j7g';

// ฟังก์ชันสำหรับการลงทะเบียนผู้ใช้ใหม่
const register =  async (req, res) => {

    const user = new User(req.body); // สร้างผู้ใช้ใหม่จากข้อมูลที่ได้รับ

    try {
        const result = await user.save(); // บันทึกผู้ใช้ลงในฐานข้อมูล
        res.status(201).json({
            message: "User registered successfully", // ส่งข้อความยืนยัน
            user: result // ส่งข้อมูลผู้ใช้ที่ถูกสร้าง
        });
    } catch (err) {
        // หากเกิดข้อผิดพลาดในการบันทึก ให้ส่งข้อผิดพลาดกลับ
        const validationErrors = Object.keys(err.errors).map(key => err.errors[key].message);
        res.status(400).json({
            message: "User registration failed", // ส่งข้อความข้อผิดพลาด
            errors: validationErrors, // ส่งรายละเอียดข้อผิดพลาด
            data: req.body // ส่งข้อมูลที่ผู้ใช้ส่งเข้ามา
        });
    }
}

// เพิ่มฟังก์ชันการค้นหาผู้ใช้
const user_search = async (req, res) => {
    try {
        const { query } = req.query; // รับค่าค้นหาจาก query string
        let UserData;

        if (query) {
            // ค้นหาผู้ใช้ที่มีอีเมลหรือบทบาทที่ตรงกับ query
            UserData = await User.find({
                $or: [
                    { email: { $regex: query, $options: 'i' } },
                    { role: { $regex: query, $options: 'i' } }
                ]
            });
        } else {
            UserData = await User.find(); // หากไม่มี query ให้ดึงข้อมูลผู้ใช้ทั้งหมด
        }
        res.json(UserData); // ส่งข้อมูลผู้ใช้กลับเป็น JSON
    } catch (err) {
        console.log(err);
        res.status(500).send('Error retrieving user data'); // ส่งข้อความข้อผิดพลาด
    }
};

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ตาม ID
const getUserById = async (req, res) => {
    const userId = req.params.id; // รับ ID ผู้ใช้จาก URL
    try {
        // ค้นหาผู้ใช้ตาม ID
        const user = await User.findById(userId);

        // ตรวจสอบว่าพบผู้ใช้หรือไม่
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้ตาม ID ที่ระบุ' });
        }

        // ส่งข้อมูลผู้ใช้กลับเป็น JSON
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการค้นหาผู้ใช้');
    }
};

// ฟังก์ชันสำหรับแก้ไขข้อมูลผู้ใช้
const user_edit = async (req, res) => {
    const userId = req.params.id; // สมมุติว่าเรามี ID ผู้ใช้ใน URL
    const { email, role, password } = req.body;

    try {
        const updatedData = {};

        // ตรวจสอบว่าอีเมลมีการเปลี่ยนแปลงหรือไม่
        if (email) {
            updatedData.email = email;
        }

        // ตรวจสอบว่าบทบาทมีการเปลี่ยนแปลงหรือไม่
        if (role) {
            updatedData.role = role;
        }

        // ตรวจสอบว่ามีการเปลี่ยนแปลงรหัสผ่านหรือไม่
        if (password && password.trim() !== "") {
            updatedData.password = await bcrypt.hash(password, 10); // เข้ารหัสรหัสผ่านใหม่
        }

        // อัปเดตข้อมูลผู้ใช้ในฐานข้อมูล
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        
        // ส่งข้อมูลผู้ใช้ที่อัปเดตแล้วกลับไปในรูปแบบ JSON
        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้" });
    }
};


// เพิ่มฟังก์ชันการลบผู้ใช้
const user_delete = async (req, res) => {
    const _id = req.params._id;
    try {
        await User.findOneAndDelete({ _id: _id });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting user');
    }
};

// ฟังก์ชันสำหรับค้นหาหุ้นตามชื่อหรือสัญลักษณ์
const stock_search = async (req, res) => {
    try {
        const { query } = req.query; // รับค่าค้นหาจาก query string
        let StockData;

        if (query) {
            StockData = await Stock.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { symbol: { $regex: query, $options: 'i' } }
                ]
            });
        } else {
            StockData = await Stock.find();
        }

        res.json(StockData); // ส่งข้อมูลหุ้นกลับเป็น JSON
    } catch (err) {
        console.log(err);
        res.status(500).send('Error retrieving stock data');
    }
};

// ฟังก์ชันสำหรับดึงข้อมูลหุ้นตาม ID
const getStockById = async (req, res) => {
    const stockId = req.params.id; // รับ ID หุ้นจาก URL
    try {
        // ค้นหาหุ้นตาม ID
        const stock = await Stock.findById(stockId);

        // ตรวจสอบว่าพบหุ้นหรือไม่
        if (!stock) {
            return res.status(404).json({ message: 'ไม่พบหุ้นตาม ID ที่ระบุ' });
        }

        // ส่งข้อมูลหุ้นกลับเป็น JSON
        res.status(200).json(stock);
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการค้นหาหุ้น');
    }
};

// ฟังก์ชันสำหรับอัปเดตหุ้นตาม ID
const updateStock = async (req, res) => {
    const stockId = req.params.id; // รับ ID หุ้นจาก URL
    const { name, symbol, price } = req.body; // รับข้อมูลใหม่จาก body

    try {
        // ตรวจสอบว่าหุ้นมีอยู่หรือไม่
        const stock = await Stock.findById(stockId);
        if (!stock) {
            return res.status(404).json({ message: 'ไม่พบหุ้นตาม ID ที่ระบุ' });
        }

        // อัปเดตข้อมูลหุ้น
        if (name) stock.name = name;
        if (symbol) stock.symbol = symbol;
        if (price) stock.price = price;

        // บันทึกการอัปเดตลงในฐานข้อมูล
        const updatedStock = await stock.save();

        // ส่งข้อมูลหุ้นที่อัปเดตแล้วกลับเป็น JSON
        res.status(200).json({
            message: 'หุ้นอัปเดตสำเร็จ',
            stock: updatedStock
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการแก้ไขหุ้น');
    }
};

// ฟังก์ชันสำหรับลบหุ้นตาม ID
const stock_delete = async (req, res) => {
    const _id = req.params._id;
    try {
        await Stock.findOneAndDelete({ _id: _id });
        res.status(200).json({ message: 'Stock deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting stock');
    }
};

// ฟังก์ชันสำหรับเพิ่มหุ้น
const stock_add = async (req, res) => {
    const stock = new Stock(req.body);
    const symbol = req.body.symbol;

    // API URL for Finnhub.io
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (!data || !data.c) {
            console.log('No stock data found');
            return res.status(500).send('Error: No stock data found');
        }

        const latestPrice = data.c; // Get the current price

        // Add stock price to MongoDB
        stock.price = latestPrice;
        const result = await stock.save(); // บันทึกหุ้นลงในฐานข้อมูล
        console.log("Stock added successfully with price:", stock.price);
        res.status(201).json({
            message: "Stock added successfully",
            stock: result
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching or saving stock data');
    }
};

// ฟังก์ชันสำหรับเรียกดูการถือครองหุ้นของ user ตาม ID
const getUserStocks = async (req, res) => {
    try {
        const userId = req.params.id; // รับ ID ผู้ใช้จาก URL
        // ดึงข้อมูล UserStock ที่เกี่ยวข้องกับ userId พร้อมข้อมูลที่เชื่อมโยง
        const userStocks = await UserStock.find({ user_id: userId })
            .populate('stock_id'); // ดึงข้อมูลจาก Stock
        
        // ส่งข้อมูลการถือหุ้นกลับเป็น JSON
        res.status(200).json(userStocks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหุ้นของผู้ใช้' });
    }
};

// ฟังก์ชันสำหรับเรียกดูการถือครองหุ้นของ user ทั้งหมด
const getAllUserStocks = async (req, res) => {
    try {
        // ดึงข้อมูล UserStock ทั้งหมด
        const userStocks = await UserStock.find()
            .populate('user_id') // ดึงข้อมูลผู้ใช้ที่เกี่ยวข้อง
            .populate('stock_id'); // ดึงข้อมูลหุ้นที่เกี่ยวข้อง
        
        // ส่งข้อมูล UserStock กลับเป็น JSON
        res.status(200).json(userStocks);
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล UserStock');
    }
};

// ฟังก์ชันสำหรับเรียกดูประวัติการซื้อขายหุ้นของ user ตาม ID
const getUserTransactions = async (req, res) => {
    const userId = req.params.id; // รับ ID ผู้ใช้จาก URL
    try {
        // ดึงข้อมูล Transaction ที่เกี่ยวข้องกับ userId พร้อมข้อมูลที่เชื่อมโยง
        const userTransactions = await Transaction.find({ user_id: userId }).populate('stock_id');

        // ถ้าไม่มีธุรกรรม ให้ส่ง message และ empty transactions array
        if (!userTransactions || userTransactions.length === 0) {
            return res.status(200).json({ transactions: [], message: 'ไม่มีประวัติการซื้อขาย' });
        }

        // ส่งประวัติการทำธุรกรรมกลับเป็น JSON
        res.status(200).json(userTransactions);
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงประวัติการซื้อขาย');
    }
};

// ฟังก์ชันสำหรับเรียกดูประวัติการซื้อขายหุ้นของ user ทั้งหมด
const getAllTransactions = async (req, res) => {
    try {
        // ดึงข้อมูลการทำธุรกรรมทั้งหมด
        const transactions = await Transaction.find()
            .populate('user_id') // ดึงข้อมูลผู้ใช้ที่เกี่ยวข้อง
            .populate('stock_id'); // ดึงข้อมูลหุ้นที่เกี่ยวข้อง
        
        // ส่งข้อมูลประวัติการซื้อขายหุ้นกลับเป็น JSON
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงประวัติการซื้อขายหุ้น');
    }
};

// ฟังก์ชันสำหรับเรียกดูว่าหุ้นนี้มีใครถือครองหุ้นบ้าง ตาม ID
const getStockHolders = async (req, res) => {
    const stockId = req.params.id; // รับ ID หุ้นจาก URL
    try {
        // ดึงข้อมูล UserStock ที่เกี่ยวข้องกับ stockId พร้อมข้อมูลที่เชื่อมโยง
        const stockHolders = await UserStock.find({ stock_id: stockId })
            .populate('user_id'); // ดึงข้อมูลจาก User

        // ถ้าไม่มีผู้ถือหุ้น ให้ส่ง message และ empty holders array
        if (!stockHolders || stockHolders.length === 0) {
            return res.status(200).json({ holders: [], message: 'ไม่มีผู้ถือหุ้นสำหรับหุ้นนี้' });
        }

        // ส่งข้อมูลผู้ถือหุ้นกลับเป็น JSON
        res.status(200).json(stockHolders);
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ถือหุ้น');
    }
};

module.exports = {
    register,
    user_search,
    getUserById,
    user_edit,
    user_delete,
    stock_search,
    getStockById,
    updateStock,
    stock_delete,
    stock_add,
    getUserStocks,
    getAllUserStocks,
    getUserTransactions,
    getAllTransactions,
    getStockHolders
}