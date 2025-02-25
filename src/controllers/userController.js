const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

exports.updateProfile = async (req, res) => {
  try {
      const userId = req.user.id; // Get userId from the token
      const updateData = req.body; // Get update data from the request body

      // Update the user profile
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
          new: true, // Return the updated document
          runValidators: true // Run schema validators on update
      });

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
          status: 'success',
          message: "User updated successfully",
          user: updatedUser
          
      });
  } catch (error) {
      res.status(500).json({
          status: 'error',
          message: 'Error updating user profile',
          error: error.message
      });
  }
};

exports.changePassword = async (req, res) => {
  try {
      const userId = req.user.id; // Get userId from the token
      const { currentPassword, newPassword } = req.body; // Get current and new password from the request body

      // Find the user by ID
      const user = await User.findById(userId).select('+password'); // Include the password field

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Validate the current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
          return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Update the user's password
      user.password = newPassword; // Set the new password (it will be hashed by the pre-save hook)
      await user.save(); // Save the user to trigger the pre-save hook

      // Return success response
      res.status(200).json({
          status: 'success',
          message: 'Password updated successfully',
      });
  } catch (error) {
      res.status(500).json({
          status: 'error',
          message: 'Error changing password',
          error: error.message,
      });
  }
};



exports.forgetPassword =  async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // Save the token to the user document
    user.resetPasswordToken = resetToken;
    // user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Return the reset token in the response
    res.status(200).json({ message: 'Reset token generated', resetToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


 exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      // resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};