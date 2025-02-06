const Location = require("../models/locationModel");
const City = require("../models/cityModel");
const Category = require("../models/categoryModel");
const mongoose = require("mongoose");

// Create a new location for a city
exports.createLocation = async (req, res) => {
  try {
    const { name, cityId, phoneNumber, exactLocation } = req.body;

    // Check if the city exists
    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    const location = await Location.create({
      name,
      city: cityId,
      phoneNumber,
      exactLocation,
    });
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

// Edit a location
exports.editLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cityId, phoneNumber, exactLocation } = req.body;

    // Check if the location exists
    const existingLocation = await Location.findById(id);
    if (!existingLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    // If cityId is provided, check if the city exists
    if (cityId) {
      const city = await City.findById(cityId);
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }
    }

    // Update location
    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      {
        name,
        ...(cityId && { city: cityId }),
        phoneNumber,
        exactLocation,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Location updated successfully",
      location: updatedLocation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating location",
      error: error.message,
    });
  }
};

// Delete a location
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Convert id to ObjectId to match the DB format
    const locationId = new mongoose.Types.ObjectId(id);

    // Check if the location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Check if the location has any categories (looking at 'branch' field instead of 'location')
    const categoriesCount = await Category.countDocuments({
      branch: locationId,
    });
    if (categoriesCount > 0) {
      return res.status(400).json({
        message:
          "Location cannot be deleted as it contains categories. Please delete all associated categories first.",
        categoriesCount,
      });
    }

    // Delete the location if no categories are linked
    await Location.findByIdAndDelete(locationId);

    res.status(200).json({
      message: "Location deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error in deleteLocation:", error);
    res.status(500).json({
      message: "Error deleting location",
      error: error.message,
    });
  }
};
