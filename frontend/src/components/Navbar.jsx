import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <Store size={26} />
        <span>ShopEase</span>
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/orders">My Orders</Link>

        {user?.role === "admin" && (
          <>
            <Link to="/admin/orders">Admin Orders</Link>
            <Link to="/admin/products">Manage Products</Link>
          </>
        )}
      </div>

      <div className="navbar-actions">
        <Link to="/cart" className="cart-link">
          <ShoppingCart size={21} />
          <span>Cart</span>
        </Link>

        {user ? (
          <>
            <span className="welcome-text">
              Hi, {user.name}
            </span>

            <button
              onClick={handleLogout}
              className="nav-button"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-button">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;