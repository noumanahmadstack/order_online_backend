const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, 
    trim: true,
  },
  image: {
    type: String,
    required: false, // Make required true if you always want an image associated with a menu
    default: null  // Default can be null or a placeholder image URL
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location', 
    required: true,
  },
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;

  