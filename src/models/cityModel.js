const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure unique city names
    trim: true,
  },
});

const City = mongoose.model('City', citySchema);
module.exports = City;
