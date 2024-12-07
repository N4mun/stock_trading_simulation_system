const { type } = require('express/lib/response')
const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true, // symbol ต้องไม่ซ้ำ เช่น AAPL 
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: false,
    }
}, { timestamps: true})

const Stock = mongoose.model('Stock', stockSchema);
module.exports = Stock;