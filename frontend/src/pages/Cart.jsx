import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      setCart(response.data.cart);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await api.put(`/cart/items/${productId}`, {
        quantity,
      });
      setCart(response.data.cart);
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to update quantity."
      );
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await api.delete(`/cart/items/${productId}`);
      setCart(response.data.cart);
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to remove product."
      );
    }
  };

  if (!user) {
    return (
      <div className="empty-cart">
        <ShoppingBag size={55} />
        <h2>Please login to view your cart</h2>
        <Link to="/login" className="hero-button">
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="status-message">Loading cart...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  const items = cart?.items || [];

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <h1>Shopping Cart</h1>
        <p>Review your selected products.</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <ShoppingBag size={55} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/" className="hero-button">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => {
              const product = item.product;

              if (!product) return null;

              return (
                <div className="cart-item" key={product._id}>
                  <img
                    src={
                      product.images?.[0] ||
                      "https://placehold.co/200x200?text=Product"
                    }
                    alt={product.name}
                  />

                  <div className="cart-item-details">
                    <h3>{product.name}</h3>
                    <p>₹{product.price.toLocaleString("en-IN")}</p>

                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          updateQuantity(
                            product._id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={15} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            product._id,
                            item.quantity + 1
                          )
                        }
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-end">
                    <strong>
                      ₹
                      {(
                        product.price * item.quantity
                      ).toLocaleString("en-IN")}
                    </strong>

                    <button
                      className="remove-button"
                      onClick={() => removeItem(product._id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Total Items</span>
              <span>{cart.totalItems || 0}</span>
            </div>

            <div className="summary-row total-row">
              <strong>Total Amount</strong>
              <strong>
                ₹{(cart.totalPrice || 0).toLocaleString("en-IN")}
              </strong>
            </div>

            <button
              className="checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>

            <Link to="/" className="continue-shopping">
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;