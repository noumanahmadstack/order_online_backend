const express = require('express');
const { protect, restrictTo } = require("../middleWares/authMiddleware");
const { createOrder, getUserOrders, AssignOrder, getRiderOrders, verifyOtp, AllOrders, Report } = require('../controllers/orderController');

const router = express.Router();


router.post("/create", protect, restrictTo("user"), createOrder);
router.get('/userOrderList',protect,restrictTo("user"),getUserOrders);
//for admin
router.get("/all_Orders", protect, restrictTo("admin"), AllOrders);
router.post("/assign_UpdateOrderStatus", protect, restrictTo("admin"), AssignOrder);
router.post('/verify_Otp',protect,restrictTo("rider"),verifyOtp);
router.get('/rider_Orders',protect,restrictTo("rider"),getRiderOrders);

//report
router.get('/report',protect,restrictTo("admin"),Report)
module.exports = router;
