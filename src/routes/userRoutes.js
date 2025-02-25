const express = require("express");
const {
  createUser,
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateProfile,
  changePassword,
  forgetPassword,
  resetPassword,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleWares/authMiddleware");

const router = express.Router();

// Route to create a user
router.post("/users", createUser);

// Route to get all users
router.get("/users", getAllUsers);

// Route to update user role - restricted to admin only
router.patch("/users/:id/role", protect, restrictTo("admin"), updateUserRole);

// Route to delete user - restricted to admin only
router.delete("/users/:id", protect, restrictTo("admin"), deleteUser);

router.get("/rider", protect, restrictTo("rider"), (req, res) => {
  res.send("Welcome, Rider");
});

router.get("/admin", protect, restrictTo("admin"), (req, res) => {
  res.send("Welcome, Admin");
});

router.put('/update_profile',protect,restrictTo("admin",'user'),updateProfile);
router.put('/update_password',protect,changePassword);
router.post("/forget_password",forgetPassword);
router.post("/reset_password",resetPassword);


module.exports = router;
