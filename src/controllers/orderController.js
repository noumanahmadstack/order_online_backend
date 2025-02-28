const Cart = require("../models/cartModel"); 
const mongoose = require('mongoose')
const Location = require("../models/locationModel");
const Product = require("../models/productModel"); // Import the Product model
const auth = require("../middleWares/authMiddleware"); 
const Order = require("../models/orderModel");
const Counter = require("../models/counterModel");
const { generateOTP, sendOTPViaEmail, notifyAdmin } = require("../middleWares/mailMiddleware");
const User = require("../models/userModel");


async function getNextOrderNumber() {
  const counter = await Counter.findByIdAndUpdate(
    'orderNumber', // Identifier for the counter
    { $inc: { sequence_value: 1 } }, // Increment the counter
    { new: true, upsert: true } // Create the counter if it doesn't exist
  );
  return `ORD-${counter.sequence_value.toString().padStart(4, '0')}`; // Format as ORD-0001, ORD-0002, etc.
}
exports.createOrder = async (req, res) => {
    const { cartId, address, mobileNumber, branchId,payment } = req.body;
    const userId = req.user.id;    
    try {

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
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
    const orderNumber = await getNextOrderNumber();
      // Step 3: Validate address and mobile number
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: 'Invalid address' });
      }
      if (!mobileNumber || typeof mobileNumber !== 'string') {
        return res.status(400).json({ message: 'Invalid mobile number' });
      }
      if (!payment || typeof payment !== 'string') {
        return res.status(400).json({ message: 'Invalid payment method' });
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
    const otp = generateOTP();
  
      // Step 6: Create order with address, mobile number, and branch ID
      const order = new Order({
        userId,
        cartId,
        orderNumber,
        otp,
        branchId: branchId, // Associate order with branch
        items: cart.items,
        status: 'Pending',
        payment:payment === '1' ? 'Cash On Delivery':'Online', 
        address: address,
        mobileNumber: mobileNumber,
        totalAmount:cart?.total,
      });
      await order.save();
      // Step 7: Clear cart (optional)
      await Cart.findByIdAndDelete(cartId);
      if (user.email) {
        await sendOTPViaEmail(user.email, otp); // Send OTP via email
      }
      await notifyAdmin(order);
      // Step 8: Notify user
    //   notifyUser(userId, order._id);
  
      res.status(200).json({ message: 'Order created successfully', order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  exports.getUserOrders = async (req, res) => {
    const userId = req.user.id;
  
    try {
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
        .populate({
          path: 'items.product',
          select: 'name',
        })
        .populate({
          path: 'items.variant',
          select: 'name',
        });
  
      // Customize the response
      const formattedOrders = orders.map((order) => ({
        _id: order._id,
        userId: order.userId,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        address: order.address,
        mobileNumber: order.mobileNumber,
        branchId: order.branchId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          productName: item.product.name, // Include product name
          variantName: item.variant.name, // Include variant name
          quantity: item.quantity,
          price: item.price,
        })),
      }));
  
      res.status(200).json({ orders: formattedOrders });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


exports.AssignOrder = async (req, res) => {
  const { orderId, riderId, action } = req.body; // Add `action` to specify the operation

  try {
      // Step 1: Validate orderId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
          return res.status(400).json({ message: 'Invalid order ID' });
      }

      // Step 2: Check if the order exists
      const order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      // Step 3: Handle different actions
      if (action === 'assign') {
          // Validate riderId for assignment
          if (!mongoose.Types.ObjectId.isValid(riderId)) {
              return res.status(400).json({ message: 'Invalid rider ID' });
          }

          // Check if the rider exists
          const rider = await User.findById(riderId);
          if (!rider) {
              return res.status(404).json({ message: 'Rider not found' });
          }

          // Check if the order is already assigned
          if (order.riderId) {
              return res.status(400).json({ message: 'Order is already assigned to a rider' });
          }

          // Assign the rider to the order
          order.riderId = riderId;
          order.status = 'Assigned'; // Update order status
          await order.save();

          // Notify the rider (optional)
          // notifyRider(riderId, orderId);

          return res.status(200).json({
              message: 'Order assigned to rider successfully',
              order,
          });
      } else if (action === 'cancel') {
          // Check if the order is already canceled
          if (order.status === 'Canceled') {
              return res.status(400).json({ message: 'Order is already canceled' });
          }

          // Cancel the order
          order.status = 'Canceled'; // Update order status
          await order.save();

          return res.status(200).json({
              message: 'Order canceled successfully',
              order,
          });
      } else {
          return res.status(400).json({ message: 'Invalid action' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};
 exports.getRiderOrders = async (req, res) => {
  const riderId = req.user.id; // Get the rider's ID from the authenticated user
  try {
      // Step 1: Fetch orders assigned to the rider
      const orders = await Order.find({ riderId })
          .populate('userId', 'first_name last_name email phone_number') // Populate user details
          .populate('items.product', 'name price'); // Populate product details

      // Step 2: Return the orders
      res.status(200).json({
          message: 'Orders fetched successfully',
          orders,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.verifyOtp= async (req, res) => {
  const { orderId, otp } = req.body;
  const riderId = req.user._id; // Get the rider's ID from the authenticated user

  try {
      // Step 1: Find the order
      const order = await Order.findOne({ _id: orderId, riderId });
      if (!order) {
          return res.status(404).json({ message: 'Order not found or not assigned to you' });
      }

      // Step 2: Check if the OTP matches
      if (order.otp !== otp) {
          return res.status(400).json({ message: 'Invalid OTP' });
      }

      // Step 3: Check if the OTP is still valid (optional: add OTP expiry)
      const currentTime = new Date();
      const otpExpiryTime = new Date(order.updatedAt.getTime() + 10 * 60000); // OTP valid for 10 minutes
      if (currentTime > otpExpiryTime) {
          return res.status(400).json({ message: 'OTP has expired' });
      }

      // Step 4: Update the order status to "Delivered"
      order.status = 'Delivered';
      order.otp = null; // Clear the OTP
      await order.save();

      res.status(200).json({
          message: 'Order marked as delivered successfully',
          order,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.AllOrders = async (req, res) => {
  try {
    const { branchId } = req.query; // Get branch ID from query parameters

    let query = {};
    if (branchId) {
      // Check if branch exists
      const branch = await Location.findById(branchId);
      if (!branch) {
        return res.status(400).json({ message: 'Invalid branch ID' });
      }
      query.branchId = branchId;
    }

    // Fetch orders with populated data
    const orders = await Order.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate({
        path: 'userId',
        select: 'first_name last_name email phone_number', // User details
      })
      .populate({
        path: 'riderId',
        select: 'first_name last_name', // Rider details
      })
      .populate({
        path: 'items.product',
        select: 'name', // Product name
      })
      .populate({
        path: 'items.variant',
        select: 'name', // Variant name
      });

    // Transform the orders to include names directly in the items
    const formattedOrders = orders.map(order => {
      // Convert Mongoose document to plain object
      const orderObj = order.toObject();
      
      // Format items to include product and variant names
      if (orderObj.items && Array.isArray(orderObj.items)) {
        orderObj.items = orderObj.items.map(item => ({
          ...item,
          productName: item.product?.name || 'Unknown Product',
          variantName: item.variant?.name || 'Unknown Variant',
        }));
      }
      
      // Add user information if available
      if (orderObj.userId) {
        orderObj.customerName = [orderObj.userId.first_name, orderObj.userId.last_name]
          .filter(Boolean)
          .join(' ') || 'Unknown Customer';
        orderObj.customerEmail = orderObj.userId.email;
        orderObj.customerPhone = orderObj.userId.phone_number;
      }
      
      // Add rider information if available
      if (orderObj.riderId) {
        orderObj.riderName = [orderObj.riderId.first_name, orderObj.riderId.last_name]
          .filter(Boolean)
          .join(' ') || 'Unknown Rider';
      }
      
      return orderObj;
    });

    res.json({
      success: true,
      message: branchId ? `Orders for branch ${branchId}` : 'All orders',
      data: formattedOrders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};



// API endpoint to generate order report
exports.Report = async (req, res) => {
  const { branchId, startDate, endDate } = req.query; // Get query parameters

  try {
      let matchQuery = {};

      // Filter by branchId if provided
      if (branchId) {
          matchQuery.branchId = new mongoose.Types.ObjectId(branchId);
      }

      // Filter by date range if startDate and endDate are provided
      if (startDate && endDate) {
          matchQuery.createdAt = {
              $gte: new Date(startDate), // Greater than or equal to startDate
              $lte: new Date(endDate),  // Less than or equal to endDate
          };
      }

      // Aggregate orders to generate the report
      const report = await Order.aggregate([
          { $match: matchQuery }, // Apply filters (branchId and date range)
          {
              $group: {
                  _id: branchId ? '$branchId' : null, // Group by branchId if provided
                  totalOrders: { $sum: 1 }, // Count total orders
                  totalAmount: { $sum: '$totalAmount' }, // Sum total order price
                  totalQuantity: { $sum: { $sum: '$items.quantity' } }, // Sum total quantity
                  pendingOrders: {
                      $sum: {
                          $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0],
                      },
                  },
                  assignedOrders: {
                      $sum: {
                          $cond: [{ $eq: ['$status', 'Assigned'] }, 1, 0],
                      },
                  },
                  deliveredOrders: {
                      $sum: {
                          $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0],
                      },
                  },
                  canceledOrders: {
                      $sum: {
                          $cond: [{ $eq: ['$status', 'Cancel'] }, 1, 0],
                      },
                  },
              },
          },
          {
              $lookup: {
                  from: 'locations', // Join with the Location collection
                  localField: '_id',
                  foreignField: '_id',
                  as: 'branch',
              },
          },
          {
              $unwind: {
                  path: '$branch',
                  preserveNullAndEmptyArrays: true, // Include orders without a branch
              },
          },
          {
              $project: {
                  _id: 0, // Exclude the _id field
                  branch: { $ifNull: ['$branch.name', 'Overall'] }, // Use branch name or "Overall"
                  totalOrders: 1,
                  totalAmount: 1,
                  totalQuantity: 1,
                  pendingOrders: 1,
                  assignedOrders: 1,
                  deliveredOrders: 1,
                  canceledOrders: 1,
              },
          },
      ]);

      res.status(200).json({
          success: true,
          data: report,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
  }
};

