const express = require("express");
const {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");
const { protect, restrictTo } = require("../middleWares/authMiddleware");

const router = express.Router();

router.post("/", protect, restrictTo("admin"), createBanner);
router.get("/", getAllBanners);
router.patch("/", protect, restrictTo("admin"), updateBanner);
router.delete("/:bannerId", protect, restrictTo("admin"), deleteBanner);

module.exports = router;
