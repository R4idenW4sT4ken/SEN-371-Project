import { useEffect, useState } from "react";
import { AUTH_EVENT, getStoredUser } from "../utils/auth.js";

export function useAuth() {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, isAdmin: user?.role === "admin" };
}