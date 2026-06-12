import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("emenu_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((response) => setUser(response.data.data.user))
      .catch(() => localStorage.removeItem("emenu_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const response = await api.post("/auth/login", payload);
    localStorage.setItem("emenu_token", response.data.data.token);
    setUser(response.data.data.user);
    await Swal.fire("Signed in", response.data.message, "success");
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    localStorage.setItem("emenu_token", response.data.data.token);
    setUser(response.data.data.user);
    await Swal.fire("Account created", response.data.message, "success");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      await Swal.fire("Signed out", "You have been logged out.", "success");
    } finally {
      localStorage.removeItem("emenu_token");
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, loading, authenticated: Boolean(user), login, register, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
