
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Helper function to get cart details
const getCartDetails = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product"
  );

  if (!cart) {
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };
  }

  const validItems = cart.items.filter((item) => item.product);

  const totalItems = validItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = validItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return {
    _id: cart._id,
    items: validItems,
    totalItems,
    totalPrice,
  };
};

// GET /api/cart - Get logged-in user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await getCartDetails(req.user.id);

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch cart",
    });
  }
};

// POST /api/cart - Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (
      !productId ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid product ID and quantity",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient product stock",
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: "Requested quantity exceeds available stock",
          });
        }

        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
        });
      }

      await cart.save();
    }

    const updatedCart = await getCartDetails(req.user.id);

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(400).json({
      success: false,
      message: "Unable to add product to cart. Check the product ID.",
    });
  }
};

// PUT /api/cart/items/:productId - Update quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your cart",
      });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await getCartDetails(req.user.id);

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    res.status(400).json({
      success: false,
      message: "Unable to update cart",
    });
  }
};

// DELETE /api/cart/items/:productId - Remove one product
exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your cart",
      });
    }

    await cart.save();

    const updatedCart = await getCartDetails(req.user.id);

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    res.status(400).json({
      success: false,
      message: "Unable to remove product",
    });
  }
};

// DELETE /api/cart - Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to clear cart",
    });
  }
};
