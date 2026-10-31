
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// POST /api/orders - Place an order
exports.createOrder = async (req, res) => {
  let createdOrder;
  const reducedStock = [];

  try {
    const {
      name,
      fullName,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      shippingAddress,
      paymentMethod = "COD",
    } = req.body;

    const customerName = fullName || name || shippingAddress?.fullName || shippingAddress?.name;
    const shippingPhone = phone || shippingAddress?.phone;
    const shippingAddressLine = address || shippingAddress?.address;
    const shippingCity = city || shippingAddress?.city;
    const shippingState = state || shippingAddress?.state;
    const shippingPostalCode = postalCode || shippingAddress?.postalCode;
    const shippingCountry = country || shippingAddress?.country || "India";

    if (
      !customerName ||
      !shippingPhone ||
      !shippingAddressLine ||
      !shippingCity ||
      !shippingState ||
      !shippingPostalCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all shipping details",
      });
    }

    if (!["COD", "UPI", "CARD", "Online"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have enough stock`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || "",
      });

      totalPrice += product.price * item.quantity;
    }

    // Create order. Demo online payments remain Pending.
    createdOrder = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress: {
        name: customerName,
        phone: shippingPhone,
        address: shippingAddressLine,
        city: shippingCity,
        state: shippingState,
        postalCode: shippingPostalCode,
        country: shippingCountry,
      },
      paymentMethod,
      paymentStatus: "Pending",
      orderStatus: "Processing",
      totalPrice,
    });

    // Reduce stock safely
    for (const item of cart.items) {
      const result = await Product.updateOne(
        {
          _id: item.product._id,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        }
      );

      if (result.modifiedCount !== 1) {
        throw new Error(
          `${item.product.name} stock changed. Please try again.`
        );
      }

      reducedStock.push({
        productId: item.product._id,
        quantity: item.quantity,
      });
    }

    await Cart.deleteOne({ user: req.user.id });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    // Roll back only stock that was actually reduced
    for (const item of reducedStock) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.quantity } }
      ).catch((rollbackError) => {
        console.error("Stock rollback error:", rollbackError);
      });
    }

    if (createdOrder) {
      await Order.deleteOne({ _id: createdOrder._id }).catch(
        (rollbackError) => {
          console.error("Order rollback error:", rollbackError);
        }
      );
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to place order",
    });
  }
};

// GET /api/orders/myorders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID",
    });
  }
};

// GET /api/orders - Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
};

// PUT /api/orders/:id/status - Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to update order status",
    });
  }
};
