import { Link } from "react-router-dom";
import {
  Store,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section footer-about">
          <Link to="/" className="footer-logo">
            <Store size={26} />
            <span>ShopEase</span>
          </Link>

          <p>
            Your one-stop destination for quality products
            at affordable prices. Shop smarter with ShopEase.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Shopping Cart</Link>
          <Link to="/orders">My Orders</Link>
        </div>

        <div className="footer-section">
          <h3>Customer Support</h3>
          <p>
            <Mail size={16} />
            support@shopease.com
          </p>
          <p>
            <Phone size={16} />
            +91 98765 43210
          </p>
          <p>
            <MapPin size={16} />
            Chennai, India
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} ShopEase.
          All rights reserved.
        </p>
        <p>Designed with care for a better shopping experience.</p>
      </div>
    </footer>
  );
}

export default Footer;