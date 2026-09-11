import { useCallback, useEffect, useState } from "react";
import { Search, ShoppingBag, Tags, Truck, ShieldCheck, Sparkles } from "lucide-react";
import productApi from "../api/productApi.js";
import categoryApi from "../api/categoryApi.js";
import ProductCard from "../components/ProductCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

const FREE_SHIPPING_THRESHOLD = 500;

export default function Home() {
  useDocumentTitle("Shop");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (params) => {
    setLoading(true);
    setError("");
    try {
      const response = await productApi.getAll(params);
      setProducts(response.data.products || []);
    } catch {
      setError("Unable to load products. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    categoryApi.getAll()
      .then((response) => setCategories(Array.isArray(response.data) ? response.data : []))
      .catch(() => setCategories([]));
  }, [load]);

  const search = (event) => {
    event.preventDefault();
    setKeyword(searchInput.trim());
    load({ keyword: searchInput.trim(), category: activeCategory || undefined });
  };

  const filterByCategory = (id) => {
    setActiveCategory(id);
    load({ keyword: keyword || undefined, category: id || undefined });
  };

  const activeCategoryName = categories.find((category) => category._id === activeCategory)?.name;

  return (
    <div className="main">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow"><Sparkles /> SEN371 · MERN E-commerce</span>
          <h1 className="hero-title">
            Everything you need,
            <br />
            <span className="grad">delivered to your door.</span>
          </h1>
          <p className="hero-text">
            Shop a curated catalogue of electronics, apparel, kitchenware and books —
            a production-grade storefront powered by React, Node.js and MongoDB.
          </p>
          <div className="hero-actions">
            <a href="#catalogue" className="btn btn-primary btn-lg">
              <ShoppingBag /> Browse the catalogue
            </a>
            <a href="#catalogue" className="btn btn-outline btn-lg">
              View all products
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{products.length || "—"}</strong>
              <span>Products live</span>
            </div>
            <div className="hero-stat">
              <strong>{categories.length || "—"}</strong>
              <span>Categories</span>
            </div>
            <div className="hero-stat">
              <strong>Free over</strong>
              <span>R {FREE_SHIPPING_THRESHOLD}.00</span>
            </div>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-tile">
            <div className="tile-label"><Truck /></div>
            <div className="tile-value">Fast delivery</div>
          </div>
          <div className="hero-tile">
            <div className="tile-label"><ShieldCheck /></div>
            <div className="tile-value">Secure checkout</div>
          </div>
          <div className="hero-tile">
            <div className="tile-label"><Tags /></div>
            <div className="tile-value">Best prices</div>
          </div>
          <div className="hero-tile">
            <div className="tile-label"><ShoppingBag /></div>
            <div className="tile-value">Curated picks</div>
          </div>
        </div>
      </section>

      <div className="shop-tools">
        <form className="search-bar" onSubmit={search} role="search">
          <Search />
          <input
            type="search"
            placeholder="Search products, e.g. keyboard"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            aria-label="Search products"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="category-chips" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={`chip${!activeCategory ? " active" : ""}`}
            onClick={() => filterByCategory("")}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              className={`chip${activeCategory === category._id ? " active" : ""}`}
              onClick={() => filterByCategory(category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <section id="catalogue">
        <div className="section-head">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h2 className="section-title">
              {activeCategoryName || keyword
                ? `Results${activeCategoryName ? ` · ${activeCategoryName}` : ""}${keyword ? ` for “${keyword}”` : ""}`
                : "Shop the collection"}
            </h2>
            {!activeCategoryName && !keyword && (
              <p className="section-subtitle">Hand-picked products across every category.</p>
            )}
          </div>
          {!loading && !error && (
            <span className="muted" style={{ fontSize: "0.88rem" }}>{products.length} item(s)</span>
          )}
        </div>

        {loading && (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="product-card">
                <div className="skeleton media-skeleton" style={{ aspectRatio: "4/3", borderRadius: 0 }} />
                <div className="product-body">
                  <div className="skeleton line-skeleton" style={{ width: "40%" }} />
                  <div className="skeleton line-skeleton" style={{ width: "80%" }} />
                  <div className="skeleton line-skeleton" style={{ width: "90%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <EmptyState
            title="Couldn't load the catalogue"
            copy={error}
            action={<button type="button" className="btn btn-primary" onClick={() => load({ keyword: keyword || undefined, category: activeCategory || undefined })}>Try again</button>}
          />
        )}

        {!loading && !error && products.length === 0 && (
          <EmptyState
            icon={Search}
            title="No products found"
            copy="Try a different search term or clear the category filter."
            action={<button type="button" className="btn btn-outline" onClick={() => { setKeyword(""); setSearchInput(""); setActiveCategory(""); load(); }}>Clear filters</button>}
          />
        )}

        {!loading && !error && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}