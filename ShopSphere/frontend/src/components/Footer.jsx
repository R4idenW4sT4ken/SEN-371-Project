import { Link } from "react-router-dom";
import { PackageOpen, Mail, MapPin, Phone } from "lucide-react";

function SocialIcon({ path, label }) {
  return (
    <a
      href="#"
      aria-label={label}
      onClick={(event) => event.preventDefault()}
      style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 8, background: "rgba(148,163,184,0.12)" }}
    >
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
        <path d={path} />
      </svg>
    </a>
  );
}

const ICONS = {
  github: "M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.04-.02-2.04-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.86-.38s1.95.13 2.86.38c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.42-2.68 5.4-5.23 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.13 0 .31.21.68.79.56A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm5.838 0a1.44 1.44 0 1 0 2.88 0 1.44 1.44 0 0 0-2.88 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6.375a2.375 2.375 0 1 0 0 4.75 2.375 2.375 0 0 0 0-4.75z"
};

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link className="footer-brand" to="/">
            <span className="brand-mark" style={{ width: 32, height: 32 }}><PackageOpen /></span>
            ShopSphere
          </Link>
          <p className="footer-blurb">
            A full-stack e-commerce experience built on the MERN stack with an MVC
            architecture — engineered with TDD and delivered through Agile sprints.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/">All products</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">Order history</Link></li>
            <li><Link to="/checkout">Checkout</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Log in</Link></li>
            <li><Link to="/register">Create account</Link></li>
            <li><Link to="/admin">Admin dashboard</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Mail style={{ width: 15, height: 15 }} /> support@shopsphere.dev
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Phone style={{ width: 15, height: 15 }} /> +27 11 555 0123
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin style={{ width: 15, height: 15 }} /> Johannesburg, South Africa
            </li>
            <li style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <SocialIcon path={ICONS.github} label="GitHub" />
              <SocialIcon path={ICONS.x} label="X (formerly Twitter)" />
              <SocialIcon path={ICONS.instagram} label="Instagram" />
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© {new Date().getFullYear()} ShopSphere · SEN371 Software Engineering</span>
          <span>Built with React, Node.js, Express & MongoDB</span>
        </div>
      </div>
    </footer>
  );
}