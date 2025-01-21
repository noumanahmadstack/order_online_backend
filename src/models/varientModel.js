const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variantSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // stock: { type: Number, required: false, default: 0 }
});

const Variant = mongoose.model('Variant', variantSchema);
module.exports = Variant;
