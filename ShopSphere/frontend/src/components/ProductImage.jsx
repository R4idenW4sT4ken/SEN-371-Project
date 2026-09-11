import { useEffect, useMemo, useState } from "react";
import { Package } from "lucide-react";

const GRADIENTS = [
  "linear-gradient(150deg, #eef2ff, #e0e7ff)",
  "linear-gradient(150deg, #ecfdf5, #d1fae5)",
  "linear-gradient(150deg, #fff7ed, #fed7aa)",
  "linear-gradient(150deg, #f0f9ff, #bae6fd)",
  "linear-gradient(150deg, #faf5ff, #e9d5ff)",
  "linear-gradient(150deg, #fef2f2, #fecaca)"
];

function hashName(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export default function ProductImage({ product, alt, className = "" }) {
  const name = product?.name || alt || "Product";
  const src = product?.images?.[0];
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  const gradient = useMemo(() => GRADIENTS[hashName(name) % GRADIENTS.length], [name]);

  if (!src || failed) {
    return (
      <div className={`media-fallback ${className}`} style={{ background: gradient }} aria-hidden="true">
        <Package style={{ width: "34%", height: "34%", color: "rgba(79,70,229,0.5)" }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}