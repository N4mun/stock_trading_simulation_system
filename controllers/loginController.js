const bcrypt = require('bcrypt') // นำเข้าโมดูล การเข้ารหัสเพื่อความปลอดภัย
const User = require('../models/user')

// ฟังก์ชัน ส่งหน้า login
const login = (req, res) => {
    // แสดงหน้า login
    res.render('login', { messages: req.flash('error') });
}

// ฟังก์ชันการ ตรวจสอบ email password ว่าตรงกับใน database ไหม
const loginForm = (req, res) => {
    // ตรวจสอบ email และ password ในการ login
    const {email, password} = req.body;

    User.findOne({email: email})
    .then((user) => {
        if (user) {
            bcrypt.compare(password, user.password).then((match) => {
                if (match) {
                    // บันทึก `userId` ลงใน `session`
                    req.session.userId = user._id;

                    // รีไดเร็กต์ไปยังหน้าหลัก (home)
                    res.redirect('/home');
                } else {
                    // แจ้งเตือนเมื่อรหัสผ่านไม่ถูกต้อง
                    req.flash('error', 'รหัสผ่านไม่ถูกต้อง');
                    res.redirect('/login');
                }
            });
        } else {
            // แจ้งเตือนเมื่อไม่พบผู้ใช้
            req.flash('error', 'ไม่พบผู้ใช้งาน');
            res.redirect('/login');
        }
    })
    .catch((err) => {
        console.log(err);
        res.redirect('/login');
    });
}


module.exports = {
    login,
    loginForm
}