var express = require('express')
const indexController = require('../controllers/indexController')
var router = express.Router()

/* เรียกใช้หน้า index. */
router.get('/', indexController.index)

module.exports = router;
