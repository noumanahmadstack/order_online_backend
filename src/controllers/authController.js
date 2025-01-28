const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Helper Function to Generate Token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  };

// Signup API
exports.signup = async (req, res) => {
    try {
      const { first_name, last_name, email, phone_number, password, role } = req.body;
  
      // Check if User Already Exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
  
      // Create New User
      const user = await User.create({ first_name, last_name, email, phone_number, password, role });
      const token = generateToken(user);
  
      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user._id, first_name: user.first_name, email: user.email, role: user.role },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  };

// Login API
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if User Exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate Password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, first_name: user.first_name, email: user.email,role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};