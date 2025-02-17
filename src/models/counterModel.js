const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Identifier for the counter (e.g., 'orderNumber')
    sequence_value: { type: Number, default: 0 }, // Current counter value
  });
  
const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;
