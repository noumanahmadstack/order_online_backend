const express = require("express");

const { protect, restrictTo } = require("../middleWares/authMiddleware");
const {
  getAllVariants,
  createVariant,
  updateVariant,
  deleteVariant,
} = require("../controllers/variantController");

const router = express.Router();

// Route to create a variant
router.post("", protect, restrictTo("admin"), createVariant);

// Route to get all variants
router.get("/allVariants", protect, restrictTo("admin"), getAllVariants);

// Route to update a variant
router.patch("/:id", protect, restrictTo("admin"), updateVariant);

// Route to delete a variant
router.delete("/:id", protect, restrictTo("admin"), deleteVariant);

module.exports = router;
