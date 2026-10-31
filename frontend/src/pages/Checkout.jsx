
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, Smartphone, CreditCard } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get("/cart");
        setCart(response.data.cart);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load cart.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCart();
    else setLoading(false);
  }, [user]);

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setError("");

    navigate("/payment", {
      state: {
        shippingAddress,
        paymentMethod,
        totalPrice: cart.totalPrice,
      },
    });
  };

  if (!user) {
    return (
      <div className="empty-cart">
        <h2>Please login before checkout.</h2>
        <button className="checkout-button" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    );
  }

  if (loading) return <p className="status-message">Loading checkout...</p>;

  if (!cart?.items?.length) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty.</h2>
        <button className="checkout-button" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <main className="checkout-page">
      <h1>Checkout</h1>
      <p className="checkout-description">
        Enter your delivery details and select a payment method.
      </p>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleContinue}>
          <h2>Shipping Address</h2>

          {error && <div className="error-message">{error}</div>}

          <label>Full Name</label>
          <input name="fullName" value={shippingAddress.fullName} onChange={handleChange} required />

          <label>Phone Number</label>
          <input name="phone" type="tel" value={shippingAddress.phone} onChange={handleChange} required />

          <label>Address</label>
          <textarea name="address" value={shippingAddress.address} onChange={handleChange} required />

          <label>City</label>
          <input name="city" value={shippingAddress.city} onChange={handleChange} required />

          <label>State</label>
          <input name="state" value={shippingAddress.state} onChange={handleChange} required />

          <label>Postal Code</label>
          <input name="postalCode" value={shippingAddress.postalCode} onChange={handleChange} required />

          <label>Country</label>
          <input name="country" value={shippingAddress.country} onChange={handleChange} required />

          <h2 className="payment-heading">Select Payment Method</h2>

          <div className="payment-methods">
            <label className={`payment-option ${paymentMethod === "COD" ? "selected" : ""}`}>
              <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={(e) => setPaymentMethod(e.target.value)} />
              <Banknote size={24} />
              <span>Cash on Delivery</span>
            </label>

            <label className={`payment-option ${paymentMethod === "UPI" ? "selected" : ""}`}>
              <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === "UPI"} onChange={(e) => setPaymentMethod(e.target.value)} />
              <Smartphone size={24} />
              <span>UPI Payment</span>
            </label>

            <label className={`payment-option ${paymentMethod === "CARD" ? "selected" : ""}`}>
              <input type="radio" name="paymentMethod" value="CARD" checked={paymentMethod === "CARD"} onChange={(e) => setPaymentMethod(e.target.value)} />
              <CreditCard size={24} />
              <span>Credit / Debit Card</span>
            </label>
          </div>

          <button type="submit" className="checkout-button">
            Continue to Payment
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          {cart.items.map((item) => (
            <div className="summary-row" key={item.product._id}>
              <span>{item.product.name} × {item.quantity}</span>
              <strong>₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</strong>
            </div>
          ))}

          <div className="summary-row total-row">
            <strong>Total</strong>
            <strong>₹{(cart.totalPrice || 0).toLocaleString("en-IN")}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
