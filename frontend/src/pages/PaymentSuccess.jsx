import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;
  const demo = location.state?.demo;

  if (!order) {
    return (
      <div className="payment-success-page">
        <div className="payment-success-card">
          <h2>Order details not found</h2>
          <button
            className="checkout-button"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="payment-success-page">
      <div className="payment-success-card">
        <CheckCircle className="success-icon" size={75} />

        <h1>Order Placed Successfully!</h1>

        <p className="success-description">
          Thank you for shopping with ShopEase.
        </p>

        <div className="success-order-details">
          <div>
            <span>Order ID</span>
            <strong>{order._id}</strong>
          </div>

          <div>
            <span>Total Amount</span>
            <strong>
              ₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>Payment Method</span>
            <strong>{order.paymentMethod}</strong>
          </div>

          <div>
            <span>Payment Status</span>
            <strong>{order.paymentStatus || "Pending"}</strong>
          </div>

          <div>
            <span>Order Status</span>
            <strong>{order.orderStatus}</strong>
          </div>
        </div>

        {demo && (
          <p className="demo-notice">
            This was a demo payment simulation. No actual money was collected.
          </p>
        )}

        <div className="success-actions">
          <button
            className="checkout-button"
            onClick={() => navigate("/orders")}
          >
            <Package size={18} />
            View My Orders
          </button>

          <button
            className="continue-shopping-button"
            onClick={() => navigate("/products")}
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </button>
        </div>
      </div>
    </main>
  );
}

export default PaymentSuccess;