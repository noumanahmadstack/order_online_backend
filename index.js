

const express = require('express');
require('dotenv').config();
const connectDB = require('./src/config/database'); 

const routes = require('./src/routes/index');
const app = express()

// mongoose conntetion
connectDB();

// Middleware to parse JSON requests
app.use(express.json());
app.use('/api', routes)


// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
