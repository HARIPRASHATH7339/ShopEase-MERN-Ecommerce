import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data.products || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    "All",
    ...new Set(
      products.map((product) => product.category)
    ),
  ];

  let filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      product.category === category;

    return matchesSearch && matchesCategory;
  });

  if (sort === "low") {
    filteredProducts.sort(
      (a, b) => a.price - b.price
    );
  } else if (sort === "high") {
    filteredProducts.sort(
      (a, b) => b.price - a.price
    );
  } else if (sort === "name") {
    filteredProducts.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  return (
    <main className="products-page">
      <section className="products-page-header">
        <p className="section-subtitle">
          EXPLORE OUR COLLECTION
        </p>

        <h1>All Products</h1>

        <p>
          Find the products you love at great prices.
        </p>
      </section>

      <section className="products-page-content">
        <div className="products-toolbar">
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

          <div className="sort-box">
            <SlidersHorizontal size={18} />

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
            >
              <option value="default">
                Default Sorting
              </option>

              <option value="low">
                Price: Low to High
              </option>

              <option value="high">
                Price: High to Low
              </option>

              <option value="name">
                Name: A to Z
              </option>
            </select>
          </div>
        </div>

        <div className="category-filters">
          {categories.map((item) => (
            <button
              key={item}
              className={
                category === item
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="status-message">
            Loading products...
          </p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="status-message">
            No products found.
          </p>
        ) : (
          <>
            <p className="products-count">
              Showing {filteredProducts.length} products
            </p>

            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Products;