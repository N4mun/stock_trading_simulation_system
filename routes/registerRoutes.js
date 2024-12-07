var express = require('express')
const registerController = require('../controllers/registerController')
var router = express.Router()

// แสดงหน้า register
router.get('/', registerController.register)

module.exports = router;