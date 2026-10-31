import { ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function ProductCard({ product }) {
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add products to your cart.");
      return;
    }

    try {
      await api.post("/cart", {
        productId: product._id,
        quantity: 1,
      });

      alert("Product added to cart successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to add product to cart."
      );
    }
  };

  return (
    <div className="product-card">
      <Link
        to={`/products/${product._id}`}
        className="product-image-link"
      >
        <img
          src={
            product.images?.[0] ||
            "https://placehold.co/600x600?text=Product"
          }
          alt={product.name}
          className="product-image"
        />
      </Link>

      <div className="product-info">
        <p className="product-category">{product.category}</p>

        <Link
          to={`/products/${product._id}`}
          className="product-name"
        >
          {product.name}
        </Link>

        <div className="product-rating">
          <Star size={16} fill="currentColor" />
          <span>{product.ratings || 0}</span>
        </div>

        <div className="product-bottom">
          <h3>₹{product.price?.toLocaleString("en-IN")}</h3>

          <button
            className="add-cart-button"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={17} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;