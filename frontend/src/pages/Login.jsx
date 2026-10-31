import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login API Error:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        response: err.response?.data,
        url: err.config?.baseURL + err.config?.url,
      });

      if (err.response) {
        setError(
          err.response.data?.message ||
            `Login failed. Server error: ${err.response.status}`
        );
      } else if (err.code === "ERR_NETWORK") {
        setError(
          "Network Error: Unable to connect to ShopEase server. Please check your internet connection."
        );
      } else {
        setError(
          `Login failed: ${err.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome Back!</h1>

        <p>Login to your ShopEase account.</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <label>Email Address</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;