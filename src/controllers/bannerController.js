const Banner = require("../models/bannerModel");
const { v2: cloudinary } = require("cloudinary");

exports.createBanner = async (req, res) => {
  try {
    const { description, image } = req.body;

    // Upload image to Cloudinary
    let imageUrl = null;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "banners",
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
    } else {
      return res.status(400).json({ message: "Banner image is required" });
    }

    // Create banner
    const banner = await Banner.create({
      image: imageUrl,
      description,
    });

    res.status(201).json({
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating banner",
      error: error.message,
    });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });

    if (banners.length === 0) {
      return res.status(404).json({ message: "No banners found" });
    }

    res.json(banners);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching banners",
      error: error.message,
    });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { bannerId, description, image } = req.body;

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    let imageUrl = banner.image;
    if (image) {
      try {
        // Delete old image
        if (banner.image) {
          const publicId = banner.image.split("/").slice(-1)[0].split(".")[0];
          await cloudinary.uploader.destroy(`banners/${publicId}`);
        }

        // Upload new image
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "banners",
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

    const updatedBanner = await Banner.findByIdAndUpdate(
      bannerId,
      {
        description: description || banner.description,
        image: imageUrl,
      },
      { new: true }
    );

    res.json({
      message: "Banner updated successfully",
      banner: updatedBanner,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating banner",
      error: error.message,
    });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // Delete image from Cloudinary
    if (banner.image) {
      try {
        const publicId = banner.image.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`banners/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
      }
    }

    await Banner.findByIdAndDelete(bannerId);

    res.json({
      message: "Banner deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting banner",
      error: error.message,
    });
  }
};
