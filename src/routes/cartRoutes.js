const express = require('express');
const { createCart, getCart, deleteCartItem } = require("../controllers/cartController");
const { protect, restrictTo } = require("../middleWares/authMiddleware");

const router = express.Router();

// Route to create a city
router.post("/create", protect, restrictTo("user"), createCart);
router.get('',protect,restrictTo("user"),getCart);
router.delete('/deleteCartItem/:id',protect, restrictTo("user"),deleteCartItem);
module.exports = router;
