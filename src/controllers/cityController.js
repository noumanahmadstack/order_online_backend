const City = require('../models/cityModel');

// Create a new city
exports.createCity = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the city already exists
    const existingCity = await City.findOne({ name });
    if (existingCity) {
      return res.status(400).json({ message: 'City already exists' });
    }

    const city = await City.create({ name });
    res.status(201).json({
      message: 'City created successfully',
      city,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating city', error: error.message });
  }
};

// Get all cities
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find(); // Fetch all cities from the database
    res.status(200).json({
      message: 'Cities retrieved successfully',
      cities,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching cities',
      error: error.message,
    });
  }
};

