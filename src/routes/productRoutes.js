const express = require("express");
const {
  createCategory,
  getCategoryByBranch,
  addCategoryProduct,
  getProductByCategory,
  updateProduct,
  getProductByBranch,
  deleteProduct, // Add this import
  deleteCategory,
} = require("../controllers/productController");
const { protect, restrictTo } = require("../middleWares/authMiddleware");

const router = express.Router();

// category
router.post("/category", protect, restrictTo("admin"), createCategory);
router.get("/category/:id", getCategoryByBranch);
router.delete(
  "/category/:categoryId",
  protect,
  restrictTo("admin"),
  deleteCategory
);

// product
router.post("", protect, restrictTo("admin"), addCategoryProduct);
router.get("/:categoryId", getProductByCategory);
router.patch("/updateProduct", protect, restrictTo("admin"), updateProduct);
router.get("/:branchId/allProducts", getProductByBranch);
// Add the delete route
router.delete("/:productId", protect, restrictTo("admin"), deleteProduct);

module.exports = router;
