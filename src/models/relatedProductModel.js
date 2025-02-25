// models/ProductRelation.js
const mongoose = require('mongoose');

const productRelationSchema = new mongoose.Schema({
    mainProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the main product
        required: true,
    },
    relatedProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the related product
        required: true,
    },
});

const ProductRelation = mongoose.model('ProductRelation', productRelationSchema);

module.exports = ProductRelation;