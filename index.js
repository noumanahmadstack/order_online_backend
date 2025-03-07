// server.js
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./src/config/database');
const routes = require('./src/routes/index');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'https://restaurant-admin-dashboard-flax.vercel.app/',
  credentials: true
}));

// Increase payload size limit for JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// mongoose connection
connectDB();

app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("",(req,res)=>{
  return res.status(200).send('server is running successfully on port')
}
)