// ไม่สามารถเปลี่ยน path ได้
module.exports = (req, res, next) => {
    if(req.session.userId) {
        return res.redirect('/')
    }

    next()
}