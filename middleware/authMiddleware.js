const User = require('../models/user')

// ตรวจสอบว่ามีการ login เข้ามาไหม ถ้าไม่มีการ login ให้กลับไปหน้าแรก 
module.exports = (req, res, next) => {
    User.findById(req.session.userId).then((user) => {
        if (!user) {
            return res.redirect('/')
        }
        console.log('User logged in successfully')
        next()
    }).catch(error => {
        console.error(error)
    })
}