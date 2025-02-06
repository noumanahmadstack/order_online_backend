const express = require("express");
const {
  createCity,
  getAllCities,
  deleteCity,
  editCity,
} = require("../controllers/cityController");
const { protect, restrictTo } = require("../middleWares/authMiddleware");

const router = express.Router();

// Route to create a city
router.post("/city", protect, restrictTo("admin"), createCity);
router.get("/cities", getAllCities);
router.delete("/city/:id", protect, restrictTo("admin"), deleteCity);
router.put("/city/:id", protect, restrictTo("admin"), editCity);

module.exports = router;
