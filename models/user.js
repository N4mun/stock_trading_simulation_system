const { type } = require('express/lib/response')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt') // เข้ารหัส

const Schema = mongoose.Schema
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true, // email ต้องไม่ซ้ำ
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
    },
    balance: {
        type: Number,
        default: 10000.00, // ยอดเงินเริ่มต้น
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    }
}, { timestamps: true})

// ก่อนที่ข้อมูลจะเข้าไปในฐานข้อมูล ให้มีการเข้ารหัสไว้ก่อน
userSchema.pre('save', function(next) {
    const user = this // this หมายถึง userSchema
    
    bcrypt.hash(user.password, 10).then(hash => { // เข้ารหัส password 10 รอบ
        user.password = hash
        next()
    })
    .catch((err) => {
        console.log(err)
    }) 
})

const User = mongoose.model('User', userSchema);
module.exports = User;