const express = require("express");
const {
  createUser,
  getAllUsers,
  updateUserRole,
  deleteUser,
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

module.exports = router;
