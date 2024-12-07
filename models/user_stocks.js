const { type } = require('express/lib/response')
const mongoose = require('mongoose')

const userStockSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // เชื่อมโยงไปยัง Users
        required: true,
    },
    stock_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock', // เชื่อมโยงไปยัง Stocks
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    }
})

const UserStock = mongoose.model('UserStock', userStockSchema);
module.exports = UserStock;