const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City', // Reference to the City model
      required: true,
    },
  });
  
  const Location = mongoose.model('Location', locationSchema);
  module.exports = Location;
  