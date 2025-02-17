const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1, // Ensure quantity is at least 1
  },
});


const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    unique: true, // Each user has only one cart
  },
  items: [cartItemSchema], // Array of cart items
  total: {
    type: Number,
    default: 0, // Total price of all items in the cart
  },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;