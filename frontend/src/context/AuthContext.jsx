/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toastSuccess } from "../components/ui";
import { useCurrentUser } from "../hooks/useApiQueries";
import { queryKeys } from "../lib/queryKeys";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const hasToken = Boolean(localStorage.getItem("emenu_token"));
  const [sessionUser, setSessionUser] = useState(null);
  const currentUser = useCurrentUser(hasToken);
  const user = sessionUser || currentUser.data || null;
  const loading = hasToken && currentUser.isPending;

  useEffect(() => {
    if (currentUser.isError) {
      localStorage.removeItem("emenu_token");
    }
  }, [currentUser.isError]);

  const login = async (payload) => {
    const response = await api.post("/auth/login", payload);
    localStorage.setItem("emenu_token", response.data.data.token);
    setSessionUser(response.data.data.user);
    queryClient.setQueryData(queryKeys.currentUser, response.data.data.user);
    await toastSuccess(response.data.message || "Signed in");
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    localStorage.setItem("emenu_token", response.data.data.token);
    setSessionUser(response.data.data.user);
    queryClient.setQueryData(queryKeys.currentUser, response.data.data.user);
    await toastSuccess(response.data.message || "Account created");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      await toastSuccess("Signed out");
    } finally {
      localStorage.removeItem("emenu_token");
      setSessionUser(null);
      queryClient.removeQueries({ queryKey: queryKeys.currentUser });
      queryClient.removeQueries({ queryKey: queryKeys.shops });
    }
  };

  const value = { user, loading, authenticated: Boolean(user), login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
