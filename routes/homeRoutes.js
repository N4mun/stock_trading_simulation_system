// นำเข้า express และ router สำหรับการจัดการ routing
var express = require('express');
const homeController = require('../controllers/homeController'); // นำเข้าคอนโทรลเลอร์ home
var router = express.Router(); // สร้าง router ใหม่

// ตั้งค่า route สำหรับหน้าหลัก เมื่อมีการเรียก GET ที่ '/' ให้ใช้ฟังก์ชัน home จาก homeController
router.get('/', homeController.home);

// ส่งออก router เพื่อใช้งานในแอปพลิเคชัน
module.exports = router;