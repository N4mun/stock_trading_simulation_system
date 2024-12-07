const bcrypt = require('bcrypt'); // import โมดูล ใช้สำหรับการเข้ารหัส
const User = require("../models/user");

// รับค่าที่กรอกจาก หน้า register
const user_register = async (req, res) => {
    try {

        const user = new User({
            ...req.body
        });

        await user.save();
        req.session.userId = user._id;
        console.log("User registered successfully");
        res.redirect('/home');
    } catch (err) {
        if (err) {
            const validationErrors = Object.keys(err.errors).map(key => err.errors[key].message);
            req.flash('validationErrors', validationErrors);
            req.flash('data', req.body);
            return res.redirect('/register');
        }
    }
}

//ฟังก์ชันนี้ใช้ดึงข้อมูลผู้ใช้จาก MongoDB
const user_info = async (req, res) => {
    try {
        let { query } = req.query;
        let UserData;

        if (query) {
            UserData = await User.find({
                $or: [ // ใช้ในการรวมเงื่อนไขหลาย ๆ อย่างเข้าไว้ด้วยกัน โดยที่หากข้อมูลใด ๆ ตรงกับเงื่อนไขใดเงื่อนไขหนึ่งก็จะถือว่าเป็นข้อมูลที่ตรงกับการค้นหา
                    {email: { $regex: query, $options: 'i' } }, // เป็นการกำหนดให้ทำการค้นหาด้วยรูปแบบของ regular expression ซึ่งช่วยให้ค้นหาข้อมูลที่มีความคล้ายคลึงกันได้
                                                                // ไม่จำเป็นต้องตรงกันทุกตัวอักษร
                    {role: { $regex: query, $options: 'i' } } // 'i': ใช้เป็นตัวเลือกของ $regex เพื่อทำให้การค้นหาไม่สนใจตัวพิมพ์เล็กหรือพิมพ์ใหญ่ (case-insensitive)
                ]
            });
        } else {
            UserData = await User.find();
        }
        res.render('user', { users: UserData});
    } catch (err) {
        console.log(err);
        res.status(500).send('Error retrieving user data');
    }
};

//ฟังก์ชันนี้ใช้สำหรับลบข้อมูลผู้ใช้จากฐานข้อมูลโดยค้นหาจาก _id ที่ส่งมาทาง URL
const user_delete = (req, res) => {
    const _id = req.params._id;
    User.findOneAndDelete({_id: _id})
        .then(() => {
            res.redirect('/user');
        })
        .catch(err => {
            console.log(err);
        });
}

// แก้ไขผู้ใช้งาน
const user_edit = async (req, res) => {
    const _id = req.params._id;
    
    // ดึงข้อมูลของผู้ใช้ที่มีอยู่จากฐานข้อมูล
    let user = await User.findById(_id);

    // ตรวจสอบและอัปเดตข้อมูลเฉพาะที่ต้องการ
    const updatedData = {};

    if (req.body.role && req.body.role !== user.role) {
        updatedData.role = req.body.role;
    }
    
    if (req.body.email && req.body.email !== user.email) {
        updatedData.email = req.body.email;
    }

    if (req.body.balance && req.body.balance !== user.balance) {
        updatedData.balance = req.body.balance;
    }

    // ตรวจสอบว่ามีการเปลี่ยนแปลงรหัสผ่านหรือไม่
    if (req.body.password && req.body.password.trim() !== "") {
        updatedData.password = await bcrypt.hash(req.body.password, 10);
    }

    try {
        await User.findOneAndUpdate({ _id: _id }, updatedData, { new: true });
        res.redirect('/user');
    } catch (err) {
        console.log(err);
        res.status(500).send("Error updating user.");
    }
};



module.exports = {
    user_register,
    user_info,
    user_delete,
    user_edit
}
