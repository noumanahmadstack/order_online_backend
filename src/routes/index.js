const app =  require('express').Router()


const userRoutes = require('../routes/userRoutes'); // Import user routes
const authRoutes = require('../routes/authRoutes');
const cityRoutes = require('../routes/cityRoutes');
const locationRoutes = require('../routes/locationRoutes');
const productRoutes = require('../routes/productRoutes');
const variantRoutes = require('../routes/variantRoutes');
const cartRoutes = require('../routes/cartRoutes');
const orderRoutes = require('../routes/orderRoutes')
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/city', cityRoutes);
app.use('/location', locationRoutes);
app.use('/product',productRoutes);
app.use('/variant',variantRoutes);
app.use('/cart',cartRoutes);
app.use('/order',orderRoutes)
module.exports = app