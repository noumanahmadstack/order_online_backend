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
  // category routes
router.post("/category", protect, restrictTo("admin"), createCategory);
router.get("/category/:id", getCategoryByBranch);
router.patch("/category", protect, restrictTo("admin"), updateCategory); // Add this new route
router.delete("/category/:categoryId", protect, restrictTo("admin"), deleteCategory);
// Product routes
router.post("", protect, restrictTo("admin"), addCategoryProduct);
router.get("/:categoryId", getProductByCategory);
router.patch("/updateProduct", protect, restrictTo("admin"), updateProduct);
router.get("/:branchId/allProducts", getProductByBranch);
router.delete("/:productId", protect, restrictTo("admin"), deleteProduct);
module.exports = router;
