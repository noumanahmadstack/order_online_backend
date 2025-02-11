const Location = require("../models/locationModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Variant = require("../models/varientModel");
const _ = require("lodash");
const { findByIdAndUpdate } = require("../models/userModel");
const { v2: cloudinary } = require("cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createCategory = async (req, res) => {
  try {
    const { name, branchId, image } = req.body;

    // Check if a menu with the same name already exists
    const existingMenu = await Category.findOne({ name, branch: branchId });
    if (existingMenu) {
      return res.status(409).json({
        message:
          "A Category with this name already exists at the specified location",
      });
    }

    // Validate the existence of the location
    const location = await Location.findById(branchId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Upload image to Cloudinary
    let imageUrl = null;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "categories",
          use_filename: true,
          unique_filename: true,
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          message: "Image upload failed",
          error: uploadError.message,
        });
      }
    }

    // Create the menu if the location is valid and the name is unique
    const category = await Category.create({
      name,
      branch: branchId,
      image: imageUrl,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating category",
      error: error.message,
    });
  }
};

exports.getCategoryByBranch = async (req, res) => {
  try {
    const { id: branchId } = req.params;
    const category = await Category.find({ branch: branchId }).populate(
      "branch"
    );
    if (category.length === 0) {
      return res.status(404).send("No category found for this branch");
    }
    res.json(category);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching menu", error: error.message });
  }
};

exports.addCategoryProduct = async (req, res) => {
  try {
    const {
      branchId,
      categoryId,
      productName,
      productDescription,
      productPrice,
      productImage,
      isFeatured,
      variants = [], // Array of variant IDs and their respective prices
    } = req.body;

    // Validate that the Category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if a product with the same name already exists in this category
    const existingProduct = await Product.findOne({
      name: productName,
      category: categoryId,
    });
    if (existingProduct) {
      return res.status(409).json({
        message: "Product with the same name already exists in this category",
      });
    }

    // Upload image to Cloudinary if provided
    let imageUrl = null;
    if (productImage) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(productImage, {
          folder: "products",
          use_filename: true,
          unique_filename: true,
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        return res
          .status(500)
          .json({ message: "Image upload failed", error: uploadError.message });
      }
    }

    // Step 1: Validate and gather variants by their IDs
    const validatedVariants = [];
    for (const variantToSelect of variants) {
      const { variantId, price } = variantToSelect;

      // Validate that the variantId is provided and exists in the database
      if (!variantId) {
        return res.status(400).json({ message: "Variant ID is required" });
      }

      const variant = await Variant.findById(variantId);
      if (!variant) {
        return res
          .status(404)
          .json({ message: `Variant with ID ${variantId} not found` });
      }

      // Validate price for the variant
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({
          message: `Price for variant ${variantId} must be a positive number`,
        });
      }

      // Add the variant ID and the price to the validated variants array
      validatedVariants.push({
        variant: variantId, // Storing the variant ID
        price: price, // Store the price you specified for this variant
      });
    }

    // Save the product to the database
    const savedProduct = await Product.create({
      name: productName,
      description: productDescription,
      price: productPrice, // Base price for the product (can be adjusted based on variants)
      image: imageUrl,
      category: categoryId,
      location: branchId,
      isFeatured: isFeatured,
      variants: validatedVariants,
    });

    res.status(201).json({
      message: "New product added successfully",
      product: savedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding category product", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      productId,
      name,
      description,
      price,
      image,
      categoryId,
      variants,
      isFeatured,
    } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check for duplicate product name in the same category
    if (name) {
      const existingProduct = await Product.findOne({
        name,
        category: product.category,
        _id: { $ne: productId },
      });

      if (existingProduct) {
        return res.status(409).json({
          message: "A product with this name already exists in this category",
        });
      }
    }

    // Handle image update if new image is provided
    let imageUrl = product.image;
    if (image) {
      try {
        // Delete old image if exists
        if (product.image) {
          const publicId = product.image.split("/").slice(-1)[0].split(".")[0];
          await cloudinary.uploader.destroy(`products/${publicId}`);
        }

        // Upload new image
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "products",
          use_filename: true,
          unique_filename: true,
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          message: "Image upload failed",
          error: uploadError.message,
        });
      }
    }

    // Validate variants if provided
    let validatedVariants = product.variants;
    if (variants) {
      validatedVariants = [];
      for (const variantData of variants) {
        const { variantId, price } = variantData;

        if (!variantId) {
          return res.status(400).json({ message: "Variant ID is required" });
        }

        const variant = await Variant.findById(variantId);
        if (!variant) {
          return res
            .status(404)
            .json({ message: `Variant with ID ${variantId} not found` });
        }

        if (price && (isNaN(price) || price <= 0)) {
          return res.status(400).json({
            message: `Price for variant ${variantId} must be a positive number`,
          });
        }

        validatedVariants.push({
          variant: variantId,
          price: price || variantData.price,
        });
      }
    }

    // Update product with validated data
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name: name || product.name,
        description: description || product.description,
        price: price || product.price,
        image: imageUrl,
        category: categoryId || product.category,
        variants: validatedVariants,
        isFeatured: isFeatured !== undefined ? isFeatured : product.isFeatured,
      },
      { new: true }
    )
      .populate("variants.variant")
      .populate("category");

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};

exports.getProductByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const categoryProducts = await Product.find({ category: categoryId })
      .populate({
        path: "variants.variant", // Populate the 'variant' field inside 'variants' array
        select: "name", // Only get the 'name' field from Variant model
      })
      .populate("category", "name"); // Add this to populate the category name

    if (categoryProducts.length === 0) {
      return res.status(404).send("No products found for this category");
    }
    res.json(categoryProducts); // Send the populated products with category name
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching category", error: error.message });
  }
};

exports.getProductByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const categoryProducts = await Product.find({ location: branchId })
      .populate({
        path: 'variants.variant', // Populate the 'variant' field inside 'variants' array
        select: "name", // Only get the 'name' field from Variant model
      })
      .populate("category", "name") // Add this to populate the category name
      .populate("location", "name");
    if (categoryProducts.length === 0) {
      return res.status(404).send("No products found for this branch");
    }
    res.json(categoryProducts); // Send the populated products with category name
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching products", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If the product has an image, delete it from Cloudinary
    if (product.image) {
      try {
        // Extract public_id from the Cloudinary URL
        const publicId = product.image.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(productId);

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if there are any products in this category
    const productsCount = await Product.countDocuments({
      category: categoryId,
    });
    if (productsCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It contains ${productsCount} products. Please delete the products first.`,
      });
    }

    // If the category has an image, delete it from Cloudinary
    if (category.image) {
      try {
        const publicId = category.image.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`categories/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
      }
    }

    // Delete the category
    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      message: "Error deleting category",
      error: error.message,
    });
  }
};
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId, name, image } = req.body;

    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // If a new name is provided, check for duplicates
    if (name) {
      const existingCategory = await Category.findOne({
        name,
        branch: category.branch,
        _id: { $ne: categoryId }, // Exclude current category from check
      });

      if (existingCategory) {
        return res.status(409).json({
          message: "A category with this name already exists at this location",
        });
      }
    }

    // Handle image update if new image is provided
    let imageUrl = category.image; // Keep existing image by default
    if (image) {
      try {
        // If there's an existing image, delete it from Cloudinary
        if (category.image) {
          const publicId = category.image.split("/").slice(-1)[0].split(".")[0];
          await cloudinary.uploader.destroy(`categories/${publicId}`);
        }

        // Upload new image
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "categories",
          use_filename: true,
          unique_filename: true,
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          message: "Image upload failed",
          error: uploadError.message,
        });
      }
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        name: name || category.name,
        image: imageUrl,
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating category",
      error: error.message,
    });
  }
};
