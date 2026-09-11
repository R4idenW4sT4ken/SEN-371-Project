import { Star } from "lucide-react";

export default function Stars({ rating = 0, size = "sm" }) {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <span className={`rating-stars ${size === "lg" ? "lg" : ""}`} aria-label={`${rounded} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={star <= rounded ? "star filled" : "star"} />
      ))}
    </span>
  );
}