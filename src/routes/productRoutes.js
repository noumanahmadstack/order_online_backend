const express = require('express');
const { createCategory , getCategoryByBranch, addCategoryProduct, getProductByCategory, updateProduct} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleWares/authMiddleware');

const router = express.Router();

// category
router.post('/category',protect, restrictTo('admin'), createCategory);
router.get('/category/:id', getCategoryByBranch);

// product
router.post('',protect,restrictTo('admin'), addCategoryProduct);
router.get('/:categoryId', getProductByCategory);
router.patch('/updateProduct',protect,restrictTo('admin'),updateProduct)

module.exports = router;