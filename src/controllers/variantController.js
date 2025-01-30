const Variant = require("../models/varientModel");


exports.createVariant = async (req, res) => {
    try {
      const { name } = req.body;
  
      // Check if the city already exists
      const existingVariant = await Variant.findOne({ name });
      if (existingVariant) {
        return res.status(400).json({ message: 'Variant already exists' });
      }
      const variant = await Variant.create({ name});
      res.status(201).json({
        message: 'Variant created successfully',
        variant,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating variant', error: error.message });
    }
  };

  exports.getAllVariants = async (req, res) => {
    try {
      const variants = await Variant.find(); 
      res.status(200).json({
        message: 'Variants retrieved successfully',
        variants,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching variants',
        error: error.message,
      });
    }
  };