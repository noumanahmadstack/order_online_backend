const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const variant = require('./varientModel')

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    // Add this new field for the image URL
    type: String,
    required: false, // Optional based on your business rules
    default: null, // You can set a default image URL if desired
  },
  variants: [{
    _id: false,
    variant: { type: Schema.Types.ObjectId, ref: variant }, // Reference to Variant model
    price: { type: Number, required: true }, // Price for each variant
  }],
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  isFeatured: {
    type: Boolean,
    required: false,
  },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
