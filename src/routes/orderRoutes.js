const express = require('express');
const { protect, restrictTo } = require("../middleWares/authMiddleware");
const { createOrder } = require('../controllers/orderController');

const router = express.Router();

// Route to create a city
router.post("/create", protect, restrictTo("user"), createOrder);
// router.get('',protect,restrictTo("user"),getCart);
// router.delete('/deleteCartItem/:id',protect, restrictTo("user"),deleteCartItem);
module.exports = router;
