const User = require("../models/userModel");

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
//Update User 
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Validate role
    if (!["user", "rider", "admin"].includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role specified",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
//Delete User
exports.deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    const loggedInUser = req.user; // Assuming you set this in your auth middleware

    // Check if user exists
    if (!userToDelete) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if trying to delete an admin
    if (userToDelete.role === "admin" && loggedInUser.role === "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin users cannot delete other admin users",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
