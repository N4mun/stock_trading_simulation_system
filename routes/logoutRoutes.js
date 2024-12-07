var express = require('express')
const logoutController = require('../controllers/logoutController')
var router = express.Router()

router.get('/', logoutController.logout)

module.exports = router;