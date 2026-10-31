import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products");

        if (
          response.data &&
          Array.isArray(response.data.products)
        ) {
          setProducts(response.data.products);
        } else {
          console.error(
            "Unexpected Products API Response:",
            response.data
          );

          setError("Invalid products response from server.");
        }
      } catch (err) {
        console.error("Products API Error:", {
          message: err.message,
          code: err.code,
          status: err.response?.status,
          response: err.response?.data,
          url: err.config?.baseURL + err.config?.url,
        });

        if (err.response) {
          setError(
            `Unable to load products. Server Error: ${err.response.status} - ${
              err.response.data?.message || "Please try again."
            }`
          );
        } else if (err.code === "ERR_NETWORK") {
          setError(
            "Network Error: Unable to connect to ShopEase server. Please check your internet connection."
          );
        } else {
          setError(
            `Unable to load products: ${err.message}`
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-tag">WELCOME TO SHopease</p>

          <h1>
            Discover Products
            <br />
            You'll Love.
          </h1>

          <p>
            Find amazing products at great prices.
            Shop your favourites in one place.
          </p>

          <a href="#products" className="hero-button">
            Explore Products
          </a>
        </div>
      </section>

      <section className="products-section" id="products">
        <div className="section-heading">
          <div>
            <p className="section-subtitle">
              OUR COLLECTION
            </p>

            <h2>Featured Products</h2>
          </div>

          <div className="search-box">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        {loading ? (
          <p className="status-message">
            Loading products...
          </p>
        ) : error ? (
          <p className="error-message">
            {error}
          </p>
        ) : filteredProducts.length === 0 ? (
          <p className="status-message">
            No products found.
          </p>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;