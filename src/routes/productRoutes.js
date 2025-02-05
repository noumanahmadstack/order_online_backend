const express = require("express");
const {
  createCategory,
  getCategoryByBranch,
  addCategoryProduct,
  getProductByCategory,
  updateProduct,
  getProductByBranch,
  deleteProduct,
  deleteCategory,
  updateCategory, // Add this import
} = require("../controllers/productController");
const { protect, restrictTo } = require("../middleWares/authMiddleware");

const router = express.Router();

// Category routes
router
  .route("/category")
  .post(protect, restrictTo("admin"), createCategory)
  .patch(protect, restrictTo("admin"), updateCategory);

router
  .route("/category/:id")
  .get(getCategoryByBranch)
  .delete(protect, restrictTo("admin"), deleteCategory);

// Product routes
router
  .route("/products")
  .post(protect, restrictTo("admin"), addCategoryProduct);

router
  .route("/products/:productId")
  .patch(protect, restrictTo("admin"), updateProduct)
  .delete(protect, restrictTo("admin"), deleteProduct);

router.get("/products/category/:categoryId", getProductByCategory);
router.get("/products/branch/:branchId", getProductByBranch);

module.exports = router;
