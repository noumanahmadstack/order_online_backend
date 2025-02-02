const express = require('express');
const { createLocation, getLocationsByCity, deleteLocation } = require('../controllers/locationController');
const { protect, restrictTo } = require('../middleWares/authMiddleware');

const router = express.Router();

// Route to create a location for a city
router.post('/location', createLocation);

// Route to get all locations for a city
router.get('/city/:cityId/locations', getLocationsByCity);
// Route to delete a location (protected for admin only)
router.delete('/location/:id', protect, restrictTo('admin'), deleteLocation);
module.exports = router;
