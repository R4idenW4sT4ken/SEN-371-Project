import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Truck, ShieldCheck, RotateCcw, CircleCheck, CircleAlert, ShieldX, Star, MessageSquarePlus } from "lucide-react";
import productApi from "../api/productApi.js";
import reviewApi from "../api/reviewApi.js";
import cartApi from "../api/cartApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { getStoredToken, getStoredUser } from "../utils/auth.js";
import { formatPrice, formatDate, initials } from "../utils/format.js";
import ProductImage from "../components/ProductImage.jsx";
import Stars from "../components/Stars.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { refresh } = useCart();

  const currentUser = getStoredUser();

  const [product, setProduct] = useState(null);
  useDocumentTitle(product?.name || "Product");
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const [productResponse, reviewsResponse] = await Promise.all([
          productApi.getById(id),
          reviewApi.getByProduct(id)
        ]);
        if (!active) return;
        setProduct(productResponse.data);
        setReviews(Array.isArray(reviewsResponse.data) ? reviewsResponse.data : []);
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || "Unable to load product.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProduct();
    return () => { active = false; };
  }, [id]);

  const summary = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    reviews.forEach((review) => {
      const rating = Math.round(Number(review.rating) || 0);
      if (rating >= 1 && rating <= 5) counts[rating] += 1;
      total += rating;
    });
    const average = reviews.length ? total / reviews.length : 0;
    return { counts, average, totalCount: reviews.length };
  }, [reviews]);

  const addToCart = async () => {
    if (!getStoredToken()) {
      notify("Please log in to add items to your cart.", "info");
      navigate("/login");
      return;
    }
    try {
      await cartApi.addItem(id, quantity);
      notify(`${quantity} × ${product.name} added to cart.`);
      refresh();
    } catch (requestError) {
      notify(requestError.response?.data?.message || "Could not add product to cart.", "error");
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setSubmittingReview(true);
    try {
      const response = await reviewApi.create(id, {
        rating: Number(reviewRating),
        comment: reviewComment
      });
      const created = response.data;
      if (created.user?._id) {
        setReviews((current) => [created, ...current]);
      } else {
        setReviews((current) => [{ ...created, user: { _id: currentUser?.id, name: currentUser?.name } }, ...current]);
      }
      setReviewComment("");
      setReviewRating(5);
      notify("Thanks! Your review has been posted.");
    } catch (requestError) {
      notify(requestError.response?.data?.message || "Unable to submit review.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="main">
        <div className="detail-layout">
          <div className="skeleton media-skeleton" style={{ aspectRatio: "4/3" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="skeleton line-skeleton" style={{ width: "30%" }} />
            <div className="skeleton line-skeleton" style={{ width: "70%", height: 26 }} />
            <div className="skeleton line-skeleton" style={{ width: "55%" }} />
            <div className="skeleton line-skeleton" style={{ width: "90%" }} />
            <div className="skeleton line-skeleton" style={{ width: "85%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <EmptyState
        title="Product not found"
        copy={error || "We couldn't find the product you were looking for."}
        action={<Link className="btn btn-primary" to="/">Back to catalogue</Link>}
      />
    );
  }

  const out = product.stock < 1;
  const low = !out && product.stock <= 5;

  return (
    <div className="main">
      <section className="detail-layout">
        <div className="detail-media">
          <ProductImage product={product} alt={product.name} />
        </div>

        <div className="detail-info">
          <span className="detail-category">{product.category?.name || "General"}</span>
          <h1 className="detail-title">{product.name}</h1>

          {summary.totalCount > 0 && (
            <div className="detail-rating-line">
              <Stars rating={summary.average} size="lg" />
              <strong style={{ color: "var(--ink-900)" }}>
                {summary.average.toFixed(1)}
              </strong>
              <span>· {summary.totalCount} review(s)</span>
            </div>
          )}

          <div className="detail-price-row">
            <span className="detail-price">{formatPrice(product.price)}</span>
            {out ? (
              <span className="stock-badge stock-out"><ShieldX /> Out of stock</span>
            ) : low ? (
              <span className="stock-badge stock-low"><CircleAlert /> Only {product.stock} left</span>
            ) : (
              <span className="stock-badge stock-in"><CircleCheck /> {product.stock} in stock</span>
            )}
          </div>

          <p className="detail-desc">{product.description}</p>

          <div className="detail-actions">
            <div className="qty-stepper">
              <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1 || out} onClick={() => setQuantity((q) => q - 1)}>
                <Minus />
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                aria-label="Quantity"
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setQuantity(Math.max(1, Math.min(value || 1, product.stock || 1)));
                }}
              />
              <button type="button" aria-label="Increase quantity" disabled={quantity >= product.stock || out} onClick={() => setQuantity((q) => q + 1)}>
                <Plus />
              </button>
            </div>

            <button type="button" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={out} onClick={addToCart}>
              <ShoppingCart /> {out ? "Out of stock" : "Add to cart"}
            </button>
          </div>

          <div className="detail-meta">
            <div className="meta-item"><Truck /> Free shipping over R 500.00</div>
            <div className="meta-item"><ShieldCheck /> Secure & encrypted checkout</div>
            <div className="meta-item"><RotateCcw /> 30-day easy returns</div>
            <div className="meta-item"><ShoppingCart /> Item code: {product._id.slice(-6).toUpperCase()}</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ marginTop: 46 }}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Customer feedback</p>
            <h2 className="section-title">Reviews</h2>
          </div>
        </div>

        <div className="reviews-grid">
          <aside className="reviews-summary">
            <div className="summary-number">{summary.average.toFixed(1)}</div>
            <div className="rating-stars lg" style={{ marginTop: 8 }}>
              <Stars rating={summary.average} size="lg" />
            </div>
            <p className="summary-count">Based on {summary.totalCount} review(s)</p>

            <div className="summary-bars">
              {[5, 4, 3, 2, 1].map((value) => (
                <div key={value} className="summary-bar-row">
                  <span>{value}★</span>
                  <div className="summary-bar">
                    <span style={{ width: summary.totalCount ? `${(summary.counts[value] / summary.totalCount) * 100}%` : "0%" }} />
                  </div>
                  <span>{summary.counts[value]}</span>
                </div>
              ))}
            </div>
          </aside>

          <div>
            {summary.totalCount === 0 ? (
              <EmptyState
                icon={Star}
                title="No reviews yet"
                copy="Be the first to share your thoughts on this product."
              />
            ) : (
              <div className="review-list">
                {reviews.map((review) => (
                  <article key={review._id} className="review-card">
                    <div className="review-head">
                      <span className="review-avatar">{initials(review.user?.name || "Anonymous")}</span>
                      <div>
                        <div className="review-author">{review.user?.name || "Anonymous"}</div>
                        <div className="review-time">{formatDate(review.createdAt)}</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <Stars rating={review.rating} />
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </article>
                ))}
              </div>
            )}

            {getStoredToken() ? (
              <form className="review-form-card" onSubmit={submitReview}>
                <h3><MessageSquarePlus /> Write a review</h3>
                <div className="field">
                  <span>Your rating</span>
                  <div className="star-picker" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={value <= reviewRating ? "selected" : ""}
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        aria-checked={value <= reviewRating}
                        role="radio"
                        onClick={() => setReviewRating(value)}
                      >
                        <Star />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field" style={{ marginTop: 16 }}>
                  <span>Comment</span>
                  <textarea
                    required
                    maxLength="1000"
                    placeholder="What did you like or dislike about this product?"
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 18 }} disabled={submittingReview}>
                  {submittingReview ? "Posting…" : "Submit review"}
                </button>
              </form>
            ) : (
              <p className="muted" style={{ marginTop: 22, fontSize: "0.92rem" }}>
                <Link to="/login">Log in</Link> or <Link to="/register">create an account</Link> to write a review.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}