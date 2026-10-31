import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, ArrowLeft } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await api.post("/cart", {
        productId: product._id,
        quantity,
      });

      alert("Product added to cart successfully!");
      navigate("/cart");
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to add product."
      );
    }
  };

  if (loading) {
    return <p className="status-message">Loading product...</p>;
  }

  if (error || !product) {
    return (
      <div className="product-not-found">
        <h2>{error || "Product not found."}</h2>
        <button onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <main className="product-details-page">
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={17} /> Back
      </button>

      <div className="product-details-layout">
        <div className="details-image-container">
          <img
            src={
              product.images?.[0] ||
              "https://placehold.co/600x600?text=Product"
            }
            alt={product.name}
          />
        </div>

        <div className="product-details-info">
          <p className="product-category">{product.category}</p>

          <h1>{product.name}</h1>

          <div className="details-rating">
            <Star size={18} fill="currentColor" />
            <span>{product.ratings || 0} / 5</span>
          </div>

          <h2>
            ₹{product.price.toLocaleString("en-IN")}
          </h2>

          <p className="details-description">
            {product.description || "No description available."}
          </p>

          <p className="stock-info">
            {product.stock > 0
              ? `${product.stock} items available`
              : "Out of stock"}
          </p>

          <div className="details-quantity">
            <label>Quantity:</label>

            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>

            <span>{quantity}</span>

            <button
              onClick={() =>
                setQuantity((q) => Math.min(product.stock, q + 1))
              }
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>

          <button
            className="details-add-button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <ShoppingCart size={19} />
            Add to Cart
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;