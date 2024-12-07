var express = require('express')
const stockController = require('../controllers/stockController')
var router = express.Router()

router.get('/', stockController.stock_info)
router.post('/add', stockController.stockadd)
router.get('/delete/:_id', stockController.stock_delete)
router.post('/edit/:_id', stockController.stock_edit)

module.exports = router;