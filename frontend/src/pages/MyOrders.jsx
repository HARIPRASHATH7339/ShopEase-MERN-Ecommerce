import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingBag } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function MyOrders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/myorders");
        setOrders(response.data.orders || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="orders-empty">
        <h2>Please login to view your orders.</h2>
        <Link to="/login" className="hero-button">
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="status-message">Loading your orders...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <main className="orders-page">
      <div className="orders-heading">
        <div>
          <p className="section-subtitle">YOUR ACCOUNT</p>
          <h1>My Orders</h1>
          <p>Track and manage your purchases.</p>
        </div>

        <Package size={42} />
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <ShoppingBag size={55} />
          <h2>No orders yet</h2>
          <p>Your orders will appear here after checkout.</p>
          <Link to="/" className="hero-button">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-card-header">
                <div>
                  <p>ORDER ID</p>
                  <strong>{order._id}</strong>
                </div>

                <span
                  className={`order-status ${(
                    order.orderStatus || "Processing"
                  ).toLowerCase()}`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className="order-products">
                {order.items.map((item, index) => (
                  <div
                    className="order-product"
                    key={item.product || index}
                  >
                    <img
                      src={
                        item.image ||
                        "https://placehold.co/100x100?text=Product"
                      }
                      alt={item.name}
                    />

                    <div>
                      <h3>{item.name}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <strong>
                        ₹
                        {(
                          item.price * item.quantity
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div>
                  <span>Payment</span>
                  <strong>{order.paymentMethod}</strong>
                </div>

                <div>
                  <span>Payment Status</span>
                  <strong>{order.paymentStatus}</strong>
                </div>

                <div>
                  <span>Total Amount</span>
                  <strong>
                    ₹{order.totalPrice?.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="order-date">
                Ordered on:{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyOrders;