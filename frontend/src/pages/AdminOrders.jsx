import { useEffect, useState } from "react";
import { Package, RefreshCw } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminOrders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders");
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        orderStatus: status,
      });

      await fetchOrders();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to update order status."
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
    <main className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="section-subtitle">
            SHOPEASE ADMINISTRATION
          </p>
          <h1>Order Management</h1>
          <p>Manage and track customer orders.</p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={fetchOrders}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <Package size={25} />
          <p>Total Orders</p>
          <h2>{orders.length}</h2>
        </div>

        <div className="admin-stat-card">
          <p>Processing</p>
          <h2>
            {orders.filter(
              (order) => order.orderStatus === "Processing"
            ).length}
          </h2>
        </div>

        <div className="admin-stat-card">
          <p>Shipped</p>
          <h2>
            {orders.filter(
              (order) => order.orderStatus === "Shipped"
            ).length}
          </h2>
        </div>

        <div className="admin-stat-card">
          <p>Delivered</p>
          <h2>
            {orders.filter(
              (order) => order.orderStatus === "Delivered"
            ).length}
          </h2>
        </div>
      </div>

      <section className="admin-orders-section">
        <h2>Customer Orders</h2>

        {loading ? (
          <p className="status-message">Loading orders...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : orders.length === 0 ? (
          <p className="status-message">
            No orders available.
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-8)}</td>

                    <td>
                      {order.user?.name ||
                        order.shippingAddress?.fullName ||
                        "Customer"}
                    </td>

                    <td>
                      ₹
                      {Number(
                        order.totalPrice || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>{order.paymentMethod || "COD"}</td>

                    <td>
                      <span className="admin-order-status">
                        {order.orderStatus}
                      </span>
                    </td>

                    <td>
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          updateStatus(
                            order._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="Processing">
                          Processing
                        </option>
                        <option value="Shipped">
                          Shipped
                        </option>
                        <option value="Delivered">
                          Delivered
                        </option>
                        <option value="Cancelled">
                          Cancelled
                        </option>
                      </select>
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

export default AdminOrders;