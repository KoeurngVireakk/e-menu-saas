/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { toastSuccess } from "../components/ui";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("emenu_token")));

  useEffect(() => {
    const token = localStorage.getItem("emenu_token");

    if (!token) {
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
    await toastSuccess(response.data.message || "Signed in");
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    localStorage.setItem("emenu_token", response.data.data.token);
    setUser(response.data.data.user);
    await toastSuccess(response.data.message || "Account created");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      await toastSuccess("Signed out");
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
