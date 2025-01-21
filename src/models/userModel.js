const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define User Schema
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone_number: { type: String, required: true, unique: true, match: /^\d{10,15}$/ },
  password: { type: String, required: true, minlength: 6, select: false }, // Exclude by default
  role: {
    type: String,
    enum: ['user', 'rider', 'admin'], // Allowed roles
    default: 'user', // Default role
  },
}, {
  timestamps: true,
});

// Pre-save Hook to Hash Password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to Compare Passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Create User Model
const User = mongoose.model('User', userSchema);

module.exports = User;
