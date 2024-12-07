// ส่งหน้า index หน้าก่อนที่จะไปหน้า home
const index = (req, res) => {
    res.render('index')
}

module.exports = {
    index
}