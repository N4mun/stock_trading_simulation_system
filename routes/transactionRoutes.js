var express = require('express');
const transactionController = require('../controllers/transactionController');
var router = express.Router();

// สร้าง route สำหรับการแสดงประวัติการซื้อขาย
router.get('/', transactionController.transaction);

module.exports = router;
