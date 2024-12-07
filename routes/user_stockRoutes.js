var express = require('express')
const user_stockController = require('../controllers/user_stockController')
var router = express.Router()

router.get('/', user_stockController.user_stock)
router.post('/sell_stock/:_id', user_stockController.sell_stock);


module.exports = router;