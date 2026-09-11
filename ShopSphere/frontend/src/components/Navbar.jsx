import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, PackageOpen } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { clearAuth } from "../utils/auth.js";
import { initials } from "../utils/format.js";

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const { count } = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const logout = () => {
    clearAuth();
    notify("You have been logged out.", "info");
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="navbar">
        <Link className="brand" to="/" onClick={close}>
          <span className="brand-mark"><PackageOpen /></span>
          ShopSphere
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/" end onClick={close}>
            Products
          </NavLink>
          {user && (
            <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/orders" onClick={close}>
              Orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/admin" onClick={close}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          <Link className="icon-btn" to="/cart" aria-label={`Cart, ${count} items`}>
            <ShoppingCart />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>

          {user ? (
            <>
              <span className="user-chip" title={user.name}>
                <span className="avatar">{initials(user.name)}</span>
                <span className="user-chip-name">{user.name}</span>
              </span>
              <button className="logout-btn" onClick={logout} aria-label="Log out">
                <LogOut />
              </button>
            </>
          ) : (
            <Link className="btn btn-primary btn-sm" to="/login">
              <User />
              Log in
            </Link>
          )}

          <button
            className="icon-btn hamburger"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu${open ? " open" : ""}`}>
        <NavLink className="nav-link" to="/" end onClick={close}>Products</NavLink>
        {user && <NavLink className="nav-link" to="/orders" onClick={close}>Orders</NavLink>}
        {isAdmin && (
          <NavLink className="nav-link" to="/admin" onClick={close}>
            <LayoutDashboard /> Dashboard
          </NavLink>
        )}
        <div className="mobile-actions">
          <Link className="btn btn-primary btn-sm" to="/cart" onClick={close}>
            <ShoppingCart /> Cart {count > 0 && `(${count})`}
          </Link>
          {user ? (
            <button className="logout-btn" onClick={logout}>
              <LogOut /> Log out
            </button>
          ) : (
            <Link className="btn btn-outline btn-sm" to="/login" onClick={close}>
              <User /> Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}