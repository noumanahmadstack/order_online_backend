const City = require("../models/cityModel");
const Location = require("../models/locationModel"); // Add this import

// Create a new city
exports.createCity = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the city already exists
    const existingCity = await City.findOne({ name });
    if (existingCity) {
      return res.status(400).json({ message: "City already exists" });
    }

    const city = await City.create({ name });
    res.status(201).json({
      message: "City created successfully",
      city,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating city", error: error.message });
  }
};

// Get all cities
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find(); // Fetch all cities from the database
    res.status(200).json({
      message: "Cities retrieved successfully",
      cities,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching cities",
      error: error.message,
    });
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    // Check if city has any locations
    const locationCount = await Location.countDocuments({ city: id });
    if (locationCount > 0) {
      return res.status(400).json({ 
        message:
          "Cannot delete city with existing locations. Please delete all locations first.",
        hasLocations: true,
        locationCount,
      });
    }

    await City.findByIdAndDelete(id);

    res.status(200).json({
      message: "City deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error in deleteCity:", error); // Add logging for debugging
    res.status(500).json({
      message: "Error deleting city",
      error: error.message,
    });
  }
};
