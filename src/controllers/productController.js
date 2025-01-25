const Location = require("../models/locationModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Variant = require("../models/varientModel");
const _ = require('lodash');
const { findByIdAndUpdate } = require("../models/userModel");
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createCategory = async (req, res) => {
  try {
    const { name, branchId, image } = req.body;

    // Check if a menu with the same name already exists
    const existingMenu = await Category.findOne({ name, branch: branchId });
    if (existingMenu) {
      return res.status(409).json({ message: 'A Category with this name already exists at the specified location' });
    }

    // Validate the existence of the location
    const location = await Location.findById(branchId);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Upload image to Cloudinary
    let imageUrl = null;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'categories',
          use_filename: true,
          unique_filename: true
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        return res.status(500).json({ 
          message: 'Image upload failed', 
          error: uploadError.message 
        });
      }
    }

    // Create the menu if the location is valid and the name is unique
    const category = await Category.create({ 
      name, 
      branch: branchId, 
      image: imageUrl 
    });

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating category', 
      error: error.message 
    });
  }
};

exports.getCategoryByBranch = async (req, res) => {
    try {
        const { id: branchId } = req.params;
        const category = await Category.find({ branch: branchId }).populate('branch');
        if (category.length === 0) {
          return res.status(200).send('No category found for this branch');
        }
        res.json(category);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching menus', error: error.message });
      }
  };

  
  exports.addCategoryProduct = async (req, res) => {
    try {
      const { categoryId, productName, productDescription, productPrice, productImage , variants } = req.body;  // `variants` should be an array of variant details
  
      // First, validate that the Category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Check if a product with the same name already exists in the same category
      const existingProduct = await Product.findOne({ name: productName, category: categoryId });
      if (existingProduct) {
        return res.status(409).json({ message: 'Product with the same name already exists in this category' });
      }
      // Create a new product with these variants
      const newProduct = new Product({
        name: productName,
        description: productDescription,
        price: productPrice,
        image: productImage,
        category: categoryId,
        variants: variants
      });
  
      // Save the new product
      const savedProduct = await newProduct.save();
      console.log('New Product Added:', savedProduct);
      res.status(201).json({ message: 'New product added successfully', product: savedProduct });
  
    } catch (error) {
      console.error('Error adding category product:', error);
      res.status(500).json({ message: 'Error adding category product', error: error.message });
    }
  };
  
  exports.updateProduct = async (req, res) => {
    try {
      // Using findByIdAndUpdate to update an existing document in the database.
      const updatedProduct = await Product.findByIdAndUpdate(
        {_id: req.body.productId}, // ID of the product to update.
        { $set: req.body }, // Updating fields from the request body.
      );
      if (!updatedProduct) {
        // If no document is found and updated, return a 404 not found.
        return res.status(404).json({ message: 'Product not found' });
      }
      // Sending the updated product as a response.
      res.json({
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      // Handling potential errors during the database operation.
      res.status(500).json({ message: 'Error updating product', error: error.message });
    }
  }
  
  
  exports.getProductByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const categoryProducts = await Product.find({ category: categoryId }).populate('variants');  
        if (categoryProducts.length === 0) {
          return res.status(404).send('No products found for this category');
        }
        res.json(categoryProducts);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching category', error: error.message });
      }
  };
