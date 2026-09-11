import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PackageOpen, ShieldCheck, Truck, Radio, Eye, EyeOff, User, Lock, Mail } from "lucide-react";
import authApi from "../api/authApi.js";
import { setAuth } from "../utils/auth.js";
import { useToast } from "../context/ToastContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function Auth() {
  const isRegister = useLocation().pathname === "/register";
  useDocumentTitle(isRegister ? "Create account" : "Log in");
  const navigate = useNavigate();
  const { notify } = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (isRegister && form.password !== form.confirmPassword) {
      setError("Passwords don't match. Please re-enter them.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await (isRegister
        ? authApi.register(form)
        : authApi.login({ email: form.email, password: form.password }));

      setAuth({ token: response.data.token, user: response.data.user });
      notify(isRegister ? "Welcome to ShopSphere!" : `Welcome back, ${response.data.user.name}!`);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to authenticate.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main">
      <div className="auth-layout">
        <aside className="auth-panel">
          <span className="footer-brand" style={{ position: "relative", zIndex: 1 }}>
            <span className="brand-mark"><PackageOpen /></span>
            ShopSphere
          </span>
          <h2>{isRegister ? "Join the ShopSphere family." : "Good to see you again."}</h2>
          <p>
            One account for everything — browse the catalogue, track your orders in real
            time and enjoy a fast, secure checkout.
          </p>
          <div className="auth-features">
            <div className="auth-feature"><ShieldCheck /> Secure, encrypted authentication (JWT)</div>
            <div className="auth-feature"><Truck /> Free shipping on orders over R 500</div>
            <div className="auth-feature"><Radio /> Live order tracking for every purchase</div>
          </div>
        </aside>

        <div className="auth-form-side">
          <form className="auth-form" onSubmit={submit}>
            <div>
              <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
              <p className="auth-sub">{isRegister ? "A few details and you're in." : "Log in to continue shopping."}</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {isRegister && (
              <div className="field">
                <span>Full name</span>
                <div className="password-wrap" style={{ position: "relative" }}>
                  <User style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 17, height: 17, color: "var(--ink-400)" }} />
                  <input
                    required
                    minLength="2"
                    placeholder="Jane Doe"
                    autoComplete="name"
                    style={{ paddingLeft: 40 }}
                    value={form.name}
                    onChange={updateField("name")}
                  />
                </div>
              </div>
            )}

            <div className="field">
              <span>Email address</span>
              <div className="password-wrap" style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 17, height: 17, color: "var(--ink-400)" }} />
                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={{ paddingLeft: 40 }}
                  value={form.email}
                  onChange={updateField("email")}
                />
              </div>
            </div>

            <div className="field">
              <span>Password</span>
              <div className="password-wrap">
                <input
                  required
                  minLength="8"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  style={{ paddingLeft: 40 }}
                  value={form.password}
                  onChange={updateField("password")}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <Lock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 17, height: 17, color: "var(--ink-400)" }} />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="field">
                <span>Confirm password</span>
                <div className="password-wrap" style={{ position: "relative" }}>
                  <Lock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 17, height: 17, color: "var(--ink-400)" }} />
                  <input
                    required
                    minLength="8"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    style={{ paddingLeft: 40 }}
                    value={form.confirmPassword}
                    onChange={updateField("confirmPassword")}
                    autoComplete="new-password"
                    aria-invalid={form.confirmPassword.length > 0 && form.confirmPassword !== form.password}
                  />
                </div>
                {form.confirmPassword.length > 0 && form.confirmPassword !== form.password && (
                  <span style={{ color: "var(--danger)", fontSize: "0.82rem", marginTop: 6, display: "block" }}>
                    Passwords don't match yet.
                  </span>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              {submitting ? "Please wait…" : isRegister ? "Create account" : "Log in"}
            </button>

            <p className="auth-switch">
              {isRegister ? "Already have an account?" : "New to ShopSphere?"}{" "}
              <Link to={isRegister ? "/login" : "/register"}>
                {isRegister ? "Log in" : "Create an account"}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}