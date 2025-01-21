const express = require('express');
const { createLocation, getLocationsByCity } = require('../controllers/locationController');

const router = express.Router();

// Route to create a location for a city
router.post('/location', createLocation);

// Route to get all locations for a city
router.get('/city/:cityId/locations', getLocationsByCity);

module.exports = router;
