const User = require('../models/userModel');

// Create a User
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();    
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
