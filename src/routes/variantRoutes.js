const express = require('express');

const { protect, restrictTo } = require('../middleWares/authMiddleware');
const { getAllVariants, createVariant } = require('../controllers/variantController');

const router = express.Router();

// Route to create a variant
router.post('', protect, restrictTo('admin'),createVariant );
router.get('/allVariants', protect, restrictTo('admin'), getAllVariants);
module.exports = router;
