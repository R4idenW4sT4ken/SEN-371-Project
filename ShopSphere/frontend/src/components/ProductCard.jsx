import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowUpRight, CircleCheck, CircleAlert, ShieldX } from "lucide-react";
import ProductImage from "./ProductImage.jsx";
import cartApi from "../api/cartApi.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getStoredToken } from "../utils/auth.js";
import { formatPrice } from "../utils/format.js";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { refresh } = useCart();

  const out = product.stock < 1;
  const low = !out && product.stock <= 5;

  const addToCart = async () => {
    if (!getStoredToken()) {
      notify("Please log in to add items to your cart.", "info");
      navigate("/login");
      return;
    }

    try {
      await cartApi.addItem(product._id, 1);
      notify(`${product.name} added to cart.`);
      refresh();
    } catch (error) {
      notify(error.response?.data?.message || "Could not add product to cart.", "error");
    }
  };

  return (
    <article className="product-card">
      <Link
        to={`/products/${product._id}`}
        className="product-media"
        aria-label={`View ${product.name}`}
      >
        <div className="product-badges">
          {out ? (
            <span className="badge badge-out"><ShieldX /> Out of stock</span>
          ) : low ? (
            <span className="badge badge-low"><CircleAlert /> Only {product.stock} left</span>
          ) : (
            <span className="badge badge-stock"><CircleCheck /> In stock</span>
          )}
        </div>
        <ProductImage product={product} alt={product.name} />
        <button
          type="button"
          className="quick-view"
          aria-label={`View ${product.name}`}
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/products/${product._id}`);
          }}
        >
          <ArrowUpRight />
        </button>
      </Link>

      <div className="product-body">
        <span className="product-category">{product.category?.name || "General"}</span>
        <h3 className="product-name">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <span className="price">{formatPrice(product.price)}</span>
          <button
            type="button"
            className="add-cart-btn"
            disabled={out}
            onClick={addToCart}
          >
            <ShoppingCart />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}