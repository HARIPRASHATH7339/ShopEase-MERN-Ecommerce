
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Smartphone, CreditCard, CheckCircle } from "lucide-react";
import api from "../services/api";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const { shippingAddress, paymentMethod, totalPrice } = location.state || {};

  const [upiId, setUpiId] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!shippingAddress || !paymentMethod) {
    return (
      <div className="empty-cart">
        <h2>Payment session not found.</h2>
        <button className="checkout-button" onClick={() => navigate("/checkout")}>
          Back to Checkout
        </button>
      </div>
    );
  }

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");
    setProcessing(true);

    try {
      const response = await api.post("/orders", {
        shippingAddress,
        paymentMethod,
      });

      navigate("/payment-success", {
        replace: true,
        state: {
          order: response.data.order,
          demo: paymentMethod !== "COD",
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to place order.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="payment-page">
      <div className="payment-card">
        <div className="payment-top">
          <ShieldCheck size={35} />
          <h1>ShopEase Payment</h1>
          <p>Secure demo checkout</p>
        </div>

        <div className="payment-amount">
          <span>Total Amount</span>
          <h2>₹{Number(totalPrice || 0).toLocaleString("en-IN")}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handlePayment}>
          {paymentMethod === "UPI" && (
            <div className="payment-fields">
              <Smartphone size={30} />
              <h2>UPI Payment</h2>
              <p>Enter a sample UPI ID for this demo.</p>
              <label>UPI ID</label>
              <input
                type="text"
                placeholder="example@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
            </div>
          )}

          {paymentMethod === "CARD" && (
            <div className="payment-fields">
              <CreditCard size={30} />
              <h2>Card Payment</h2>
              <p>Use sample details only. No real card details.</p>
              <label>Cardholder Name</label>
              <input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Demo User"
                required
              />
              <label>Demo Card Number</label>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Enter sample number"
                required
              />
              <label>Expiry (MM/YY)</label>
              <input
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                required
              />
              <label>Demo CVV</label>
              <input
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                required
              />
            </div>
          )}

          {paymentMethod === "COD" && (
            <div className="payment-fields">
              <CheckCircle size={32} />
              <h2>Cash on Delivery</h2>
              <p>Pay when your order arrives at your doorstep.</p>
            </div>
          )}

          <button className="checkout-button" type="submit" disabled={processing}>
            {processing
              ? "Processing..."
              : paymentMethod === "COD"
              ? "Place Order"
              : "Pay Now"}
          </button>
        </form>

        <p className="demo-notice">
          Demo only. No actual payment is collected.
        </p>
      </div>
    </main>
  );
}

export default Payment;
