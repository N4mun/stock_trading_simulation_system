const register = (req, res) => {
    // รับค่าที่กรอก Email และ Password มา โดยที่กรณีเมื่อเกิด error ไม่ต้องกรอกใหม่
    let email = ""
    let password = ""
    let data = req.flash('data')[0]

    if (typeof data != "undefined") {
        email = data.email
        password = data.password
    }
    // แสดงหน้า register
    res.render('register', {
        errors: req.flash('validationErrors'),
        email: email,
        password: password
    })
}

// ส่งออกฟังก์ชัน
module.exports = {
    register
}
