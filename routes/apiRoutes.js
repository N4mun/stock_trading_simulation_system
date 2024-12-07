const express = require('express');
const apiController = require('../controllers/apiController'); // นำเข้า apiController 
const router = express.Router();

router.post('/register', apiController.register);// เพิ่มผู้ใช้
router.get('/users', apiController.user_search); // ค้นหาผู้ใช้
router.get('/users/:id', apiController.getUserById); // ค้นหาผู้ใช้ตาม ID
router.put('/users/:id', apiController.user_edit); // แก้ไขผู้ใช้ตาม ID
router.delete('/users/:_id', apiController.user_delete); // ลบผู้ใช้
router.get('/stocks', apiController.stock_search); // ค้นหาหุ้น
router.get('/stocks/:id', apiController.getStockById); // ค้นหาหุ้นตาม ID
router.put('/stocks/:id', apiController.updateStock); // แก้ไขหุ้นตาม ID
router.delete('/stocks/:_id', apiController.stock_delete); // ลบหุ้น
router.post('/stocks', apiController.stock_add); // เพิ่มหุ้น
router.get('/users/:id/stocks', apiController.getUserStocks);
router.get('/userstocks', apiController.getAllUserStocks); // ดึงข้อมูล UserStock ทั้งหมด
router.get('/users/:id/transactions', apiController.getUserTransactions); // ดูประวัติการซื้อขายของผู้ใช้
router.get('/transactions', apiController.getAllTransactions); // ดึงประวัติการซื้อขายหุ้นทั้งหมด
router.get('/stocks/:id/users', apiController.getStockHolders); // ดูผู้ถือหุ้นของหุ้น

module.exports = router;
