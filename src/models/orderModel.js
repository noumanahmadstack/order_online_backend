const mongoose = require("mongoose");


const cartItemSchema = new mongoose.Schema({
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to the Product model
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1, // Ensure quantity is at least 1
    },
  });

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
    orderNumber: { type: String, unique: true },
    items: [cartItemSchema],
    payment:String,
    totalAmount: Number,
    status: { type: String, enum: ['Pending','Assigned', 'Delivered','Cancel'], default: 'Pending' },
    otp: { type: String }, 
    address: String, // Delivery address
    mobileNumber: String, // User's mobile number
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }, // Associated branch/location
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  const Order = mongoose.model('Order', orderSchema);
  module.exports = Order;