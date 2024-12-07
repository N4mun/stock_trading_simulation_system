var express = require('express')
const loginController = require('../controllers/loginController')
var router = express.Router()

// หน้า login
router.get('/', loginController.login)
router.post('/login', loginController.loginForm)

module.exports = router;