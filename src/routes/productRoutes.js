const express = require('express');
const { createCategory , getCategoryByBranch, addCategoryProduct, getProductByCategory, updateProduct, getAllProductsByBranch, getAllFeaturedProducts, getProductByBranch} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleWares/authMiddleware');

const router = express.Router();

// category
router.post('/category',protect, restrictTo('admin'), createCategory);
router.get('/category/:id', getCategoryByBranch);

// product
router.post('',protect,restrictTo('admin'), addCategoryProduct);
router.get('/:categoryId', getProductByCategory);
router.patch('/updateProduct',protect,restrictTo('admin'),updateProduct)
router.get('/:branchId/allProducts',getProductByBranch);
module.exports = router;