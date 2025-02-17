const Cart = require("../models/cartModel"); 
const mongoose = require('mongoose')
const Location = require("../models/locationModel");
const Product = require("../models/productModel"); // Import the Product model
const auth = require("../middleWares/authMiddleware"); 
const Order = require("../models/orderModel");

exports.createOrder = async (req, res) => {
    const { cartId, address, mobileNumber, branchId } = req.body;
    const userId = req.user.id;    
    try {
      // Step 1: Retrieve cart details
      const cart = await Cart.findOne({ _id: new mongoose.Types.ObjectId(cartId), user:userId }).populate('items.product');
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      // Step 2: Validate cart (e.g., check stock)
    //   const isValid = await validateCart(cart.items);
    //   if (!isValid) {
    //     return res.status(400).json({ message: 'Cart validation failed' });
    //   }
  
      // Step 3: Validate address and mobile number
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: 'Invalid address' });
      }
      if (!mobileNumber || typeof mobileNumber !== 'string') {
        return res.status(400).json({ message: 'Invalid mobile number' });
      }
  
      // Step 4: Validate branch
      const branch = await Location.findById(branchId);
      if (!branch) {
        return res.status(400).json({ message: 'Invalid branch ID' });
      }
  
      // Step 5: Calculate total amount
    //   const totalAmount = cart.items.reduce((total, item) => {
    //     return total + item.quantity * item.price;
    //   }, 0);
  
      // Step 6: Create order with address, mobile number, and branch ID
      const order = new Order({
        userId,
        cartId,
        branchId: branchId, // Associate order with branch
        items: cart.items,
        status: 'Pending',
        address: address,
        mobileNumber: mobileNumber,
        totalAmount:cart?.total,
      });
      await order.save();
  
      // Step 7: Clear cart (optional)
      await Cart.findByIdAndDelete(cartId);
  
      // Step 8: Notify user
    //   notifyUser(userId, order._id);
  
      res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


