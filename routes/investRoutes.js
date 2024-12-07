var express = require('express')
const investController = require('../controllers/investController')
var router = express.Router()

router.get('/', investController.stock_info)
router.get('/invest_stock/:_id', investController.invest_stock)
router.post('/buy_stock/:_id', investController.buy_stock);

module.exports = router;