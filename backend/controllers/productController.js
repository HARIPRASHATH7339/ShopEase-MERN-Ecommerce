
const Product = require("../models/Product");

// GET /api/products - Get all products
exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    let query = Product.find(filter);

    if (sort === "price-low") {
      query = query.sort({ price: 1 });
    } else if (sort === "price-high") {
      query = query.sort({ price: -1 });
    } else if (sort === "newest") {
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch products",
    });
  }
};

// GET /api/products/:id - Get one product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
};

// POST /api/products - Create product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      images,
      stock,
      featured,
      ratings,
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price, category and stock are required",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      images,
      stock,
      featured,
      ratings,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({
      success: false,
      message: "Unable to create product. Check the product details.",
    });
  }
};

// PUT /api/products/:id - Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "brand",
      "images",
      "stock",
      "featured",
      "ratings",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({
      success: false,
      message: "Unable to update product. Check the details.",
    });
  }
};

// DELETE /api/products/:id - Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
};
