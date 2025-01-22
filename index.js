const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./src/config/database'); 
const routes = require('./src/routes/index');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite frontend URL
  credentials: true // Allow cookies and credentials
}));

// mongoose connection
connectDB();

// Middleware to parse JSON requests
app.use(express.json());
app.use('/api', routes);

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});