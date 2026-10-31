import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Package,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminProducts() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    image: "",
    stock: "",
    featured: false,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/products");
      setProducts(response.data.products || []);
    } catch (error) {
      alert("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      brand: "",
      image: "",
      stock: "",
      featured: false,
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: formData.image
          ? [formData.image]
          : [],
      };

      delete productData.image;

      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          productData
        );

        alert("Product updated successfully!");
      } else {
        await api.post("/products", productData);

        alert("Product added successfully!");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to save product."
      );
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "",
      brand: product.brand || "",
      image: product.images?.[0] || "",
      stock: product.stock ?? "",
      featured: product.featured || false,
    });

    setEditingId(product._id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);

      alert("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete product."
      );
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-access-denied">
        <h2>Admin Access Required</h2>
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <main className="admin-products-page">
      <div className="admin-products-heading">
        <div>
          <p>SHOPEASE ADMINISTRATION</p>
          <h1>Product Management</h1>
          <span>Manage your store products.</span>
        </div>

        <button
          className="admin-add-product-button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {showForm && (
        <section className="admin-product-form-section">
          <div className="admin-product-form-heading">
            <h2>
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>

            <button onClick={resetForm}>
              <X size={21} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-product-form-grid">
              <input
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                name="brand"
                placeholder="Brand"
                value={formData.brand}
                onChange={handleChange}
              />

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
              />

              <input
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
                required
              />

              <input
                name="stock"
                type="number"
                min="0"
                placeholder="Stock"
                value={formData.stock}
                onChange={handleChange}
                required
              />

              <input
                name="image"
                type="url"
                placeholder="Product Image URL"
                value={formData.image}
                onChange={handleChange}
              />
            </div>

            <textarea
              name="description"
              placeholder="Product Description"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <label className="admin-featured-label">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              Featured Product
            </label>

            <div className="admin-product-form-actions">
              <button type="submit">
                {editingId ? "Update Product" : "Save Product"}
              </button>

              <button
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-products-list">
        <div className="admin-products-list-heading">
          <h2>
            <Package size={22} />
            All Products
          </h2>

          <span>{products.length} Products</span>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div className="admin-products-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={
                          product.images?.[0] ||
                          "https://placehold.co/80x80?text=Product"
                        }
                        alt={product.name}
                      />
                    </td>

                    <td>
                      <strong>{product.name}</strong>
                      <small>{product.brand}</small>
                    </td>

                    <td>{product.category}</td>

                    <td>
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </td>

                    <td>{product.stock}</td>

                    <td>
                      <div className="admin-product-actions">
                        <button
                          className="admin-edit-button"
                          onClick={() => handleEdit(product)}
                          title="Edit Product"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="admin-delete-button"
                          onClick={() => handleDelete(product._id)}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminProducts;