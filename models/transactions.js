const { type } = require('express/lib/response')
const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    stock_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock', // เชื่อมไปยังตาราง 
        required: true,
    },
    transaction_type: {
        type: String,
        enum: ['BUY', 'SELL'], // ประเภทการทำรายการ
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    }
    
}, { timestamps: true})

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;