const express = require('express');
const { createCity, getAllCities } = require('../controllers/cityController');
const { protect, restrictTo } = require('../middleWares/authMiddleware');

const router = express.Router();

// Route to create a city
router.post('/city', protect, restrictTo('admin'), createCity);
router.get('/cities',  getAllCities);
module.exports = router;
