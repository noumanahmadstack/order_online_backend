const express = require("express");
const {
  createLocation,
  getLocationsByCity,
  deleteLocation,
  editLocation,
} = require("../controllers/locationController");
const { protect, restrictTo } = require("../middleWares/authMiddleware");

const router = express.Router();

// Route to create a location for a city
router.post("/location", protect, restrictTo("admin"), createLocation);

// Route to get all locations for a city
router.get("/city/:cityId/locations", getLocationsByCity);

// Route to edit a location (protected for admin only)
router.put("/location/:id", protect, restrictTo("admin"), editLocation);

// Route to delete a location (protected for admin only)
router.delete("/location/:id", protect, restrictTo("admin"), deleteLocation);

module.exports = router;
