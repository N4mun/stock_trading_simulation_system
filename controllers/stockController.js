const Stock = require("../models/stocks");
const axios = require('axios');

const apiKey = 'Your API Key';

// ทำหน้าที่แสดงหน้าเพจที่มีฟอร์มหรือข้อมูลเกี่ยวกับหุ้น
const stock = (req, res) => {
    res.render('stock');
};

// สร้างอินสแตนซ์ Stock ใหม่จากข้อมูลที่ส่งมาจากฟอร์ม (req.body)
// ดึงข้อมูลสัญลักษณ์หุ้น (symbol) จากฟอร์มที่ผู้ใช้กรอกเพื่อนำไปใช้ในการค้นหาข้อมูลจาก API
const stockadd = (req, res) => {
    const stock = new Stock(req.body);
    const symbol = req.body.symbol;
    
    // API URL for Finnhub.io
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;

    // ใช้ axios.get เพื่อทำการ request ไปยัง API และดึงข้อมูลราคาหุ้น (ที่อยู่ใน data.c)
// ถ้าไม่พบข้อมูล จะส่ง error response กลับไปให้ผู้ใช้
    axios.get(url)
        .then(response => {
            const data = response.data;

            if (!data || !data.c) {
                console.log('No stock data found');
                return res.status(500).send('Error: No stock data found');
            }

            const latestPrice = data.c; // Get the current price
// กำหนดราคาหุ้น (price) ที่ดึงจาก API ให้กับโมเดล Stock

            // Add stock price to MongoDB
            stock.price = latestPrice;
            return stock.save(); //บันทึกข้อมูลหุ้นลงใน MongoDB ด้วย stock.save() และส่งผู้ใช้ไปยังหน้า /stock เมื่อทำสำเร็จ
        })
        .then(result => {
            console.log("Stock added successfully with price:", stock.price);
            res.redirect('/stock');
        })
        //จัดการข้อผิดพลาดถ้ามีการ request หรือบันทึกข้อมูลไม่สำเร็จ
        .catch(err => {
            console.log(err);
            res.status(500).send('Error fetching or saving stock data');
        });
};


//ฟังก์ชันนี้มีหน้าที่ในการดึงข้อมูลหุ้นทั้งหมดจากฐานข้อมูล MongoDB
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

        res.render('stock', { stocks: StockData }); // ส่งข้อมูลไปยัง view 'invest'
    } catch (err) {
        console.log(err);
        res.status(500).send('Error retrieving stock data');
    }
};

//ฟังก์ชันนี้มีหน้าที่ลบหุ้นออกจากฐานข้อมูล MongoDB โดยค้นหาตาม _id ที่ส่งมาทาง URL
const stock_delete = (req, res) => {
    const _id = req.params._id;
    Stock.findOneAndDelete({_id: _id})
    .then(() => {
        res.redirect('/stock')
    })
    .catch(err => {
        console.log(err)
    })
}

//ฟังก์ชันนี้ใช้สำหรับแก้ไขข้อมูลหุ้น โดยค้นหาหุ้นที่ต้องการแก้ไขด้วย _id
const stock_edit = (req, res) => {
    const _id = req.params._id;
    const updatedData = {
        name: req.body.name,
        price: req.body.price
    };

    Stock.findOneAndUpdate({ _id: _id}, updatedData, { new: true})
        .then(result => {
            res.redirect('/stock');
        })
        .catch(err => {
            console.log(err);
        });
};

module.exports = {
    stock,
    stockadd,
    stock_info,
    stock_delete,
    stock_edit
}