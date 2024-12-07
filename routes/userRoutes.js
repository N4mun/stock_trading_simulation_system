const express = require('express')
const userController = require('../controllers/userController')
var router = express.Router()

router.get('/', userController.user_info)
router.post('/register', userController.user_register)
router.get('/delete/:_id', userController.user_delete)
router.post('/edit/:_id', userController.user_edit)

module.exports = router