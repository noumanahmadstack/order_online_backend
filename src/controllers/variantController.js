const Variant = require("../models/varientModel");
const Product = require("../models/productModel");

exports.createVariant = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the city already exists
    const existingVariant = await Variant.findOne({ name });
    if (existingVariant) {
      return res.status(400).json({ message: "Variant already exists" });
    }
    const variant = await Variant.create({ name });
    res.status(201).json({
      message: "Variant created successfully",
      variant,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating variant", error: error.message });
  }
};

exports.getAllVariants = async (req, res) => {
  try {
    const variants = await Variant.find();
    res.status(200).json({
      message: "Variants retrieved successfully",
      variants,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching variants",
      error: error.message,
    });
  }
};

exports.updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const variant = await Variant.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.status(200).json({
      message: "Variant updated successfully",
      variant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating variant",
      error: error.message,
    });
  }
};

exports.deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the variant exists
    const variant = await Variant.findById(id);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Check if the variant is used in any product
    const productUsingVariant = await Product.findOne({
      "variants.variant": id,
    });

    if (productUsingVariant) {
      return res.status(400).json({
        message: "Cannot delete variant because it is used in a product.",
        productId: productUsingVariant._id, // Optional: To help debug
      });
    }

    // If the variant is not used in any product, delete it
    await Variant.findByIdAndDelete(id);

    res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Error in deleteVariant:", error);
    res
      .status(500)
      .json({ message: "Error deleting variant", error: error.message });
  }
};
