const mongoose = require("mongoose");
const Cart = require("../models/cartModel"); // Import the Cart model
const Product = require("../models/productModel"); // Import the Product model
const auth = require("../middleWares/authMiddleware"); // Middleware for user authentication
const Variant = require("../models/varientModel");

exports.createCart = async (req, res) => {
  const items = req.body.items; // Expect an array of items
  const userId = req.user.id; // Assuming user ID is available from authentication middleware

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "No items provided or invalid format" });
  }

  try {
    // Find or create the user's cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // If the cart doesn't exist for the user, create a new one
      cart = new Cart({ user: userId, items: [], total: 0 });
    }

    // Loop through each item in the request body
    for (let i = 0; i < items.length; i++) {
      const { productId, variantId, quantity } = items[i];

      // Validate product ID and variant ID
      if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(variantId)
      ) {
        return res
          .status(400)
          .json({ message: `Invalid product or variant ID for item ${i + 1}` });
      }

      // Fetch the product
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found for item ${i + 1}` });
      }

      // Find the selected variant in the product's variants array
      const selectedVariant = product.variants.find(
        (v) => v.variant.toString() === variantId
      );

      if (!selectedVariant) {
        return res
          .status(404)
          .json({ message: `Variant not found for item ${i + 1}` });
      }

      // Check if the product variant already exists in the cart
      const cartItemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.variant.toString() === variantId
      );

      if (cartItemIndex > -1) {
        // Update quantity if the product variant already exists in the cart
        cart.items[cartItemIndex].quantity = quantity;
      } else {
        // Add new product variant to the cart
        cart.items.push({
          product: productId,
          variant: variantId,
          quantity,
        });
      }
    }

    // Calculate the total price of the cart (outside of loop)
    let total = 0;
    for (let item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const variant = product.variants.find(
          (v) => v.variant.toString() === item.variant.toString()
        );
        if (variant) {
          total += item.quantity * variant.price; // Correctly calculate the total based on variant price
        }
      }
    }

    // Update the total price of the cart
    cart.total = total;

    // Save the cart
    await cart.save();

    // Return the response with the updated cart
    res.status(200).json({ message: "Products added to cart", cart });
  } catch (error) {
    console.error("Error adding products to cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCart = async (req, res) => {
  const userId = req.user.id; // Assuming user ID is available from authentication middleware

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name image", // Include only the product name
    });

    if (!cart) {
      return res
        .status(200)
        .json({ message: "Cart is empty", cart: { items: [], total: 0 } });
    }

    // Fetch the relevant variant details for each cart item
    const cartItemsWithVariantDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.product);
        const variant = product?.variants?.find(
          // console.log(item.variant)

          (v) => v.variant.toString() === item.variant.toString()
        );
        return {
          Product: {
            _id: item?.product?._id,
            name: item?.product?.name,
            image: item?.product?.image,
          },
          variant: {
            _id: item?.variant,
            price: variant?.price, // Include only the price of the relevant variant
          },
          _id: item?._id,
          quantity: item?.quantity,
        };
      })
    );

    // Calculate the total number of items in the cart
    const totalItems = cartItemsWithVariantDetails.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    // Calculate the total price dynamically
    const total = cartItemsWithVariantDetails.reduce(
      (sum, item) => sum + item?.quantity * item?.variant.price,
      0
    );

    // Return the cart with relevant variant details
    res.status(200).json({
      message: "Cart fetched successfully",
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cartItemsWithVariantDetails,
        totalItems,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteCartItem = async (req, res) => {
  const userId = req.user.id; // Get the user ID from the authenticated user
  const itemId = req.params.id; // Get the item ID from the URL parameter

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the item in the cart by its _id
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Get the item that will be removed from the cart
    const removedItem = cart.items[itemIndex];

    // Fetch the product to get the variant price
    const product = await Product.findById(removedItem.product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the variant in the product's variants array
    const variant = product.variants.find(
      (v) => v.variant.toString() === removedItem.variant.toString()
    );
    if (!variant) {
      return res.status(404).json({ message: "Variant not found in product" });
    }

    // Calculate the price of the item to be removed
    const itemPrice = variant.price * removedItem.quantity;

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    // Update the total by subtracting the removed item's price
    cart.total -= itemPrice;

    // If the cart becomes empty, set the total to 0
    if (cart.items.length === 0) {
      cart.total = 0;
    }

    // Save the updated cart
    await cart.save();

    // Return a success response
    res.status(200).json({
      message: "Item removed from cart successfully",
      cart: cart,
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
