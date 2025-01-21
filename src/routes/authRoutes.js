const express = require('express');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup); // Signup Route
router.post('/login', login);   // Login Route

module.exports = router;