const Location = require("../models/locationModel");
const City = require("../models/cityModel");
const Category = require("../models/categoryModel");

// Create a new location for a city
exports.createLocation = async (req, res) => {
  try {
    const { name, cityId } = req.body;

    // Check if the city exists
    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    const location = await Location.create({ name, city: cityId });
    res.status(201).json({
      message: "Location created successfully",
      location,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating location", error: error.message });
  }
};

// Get all locations for a specific city
exports.getLocationsByCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    // Check if the city exists
    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    const locations = await Location.find({ city: cityId }).populate(
      "city",
      "name"
    );
    res.status(200).json({ city: city.name, locations });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching locations", error: error.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the location exists
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Check if the location has any categories
    const categoriesCount = await Category.countDocuments({ location: id });

    if (categoriesCount > 0) {
      return res.status(400).json({
        message:
          "Location cannot be deleted as it contains categories. Please delete all associated categories first.",
        categoriesCount,
      });
    }

    await Location.findByIdAndDelete(id);

    res.status(200).json({
      message: "Location deleted successfully",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting location",
      error: error.message,
    });
  }
};
