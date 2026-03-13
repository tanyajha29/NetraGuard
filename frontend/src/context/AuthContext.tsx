import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, clearToken, setToken } from "../lib/api";
import { useNavigate, NavigateFunction } from "react-router-dom";

export type User = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, navigate?: NavigateFunction) => Promise<void>;
  register: (body: { full_name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest<User>("/api/v1/auth/me")
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string, nav?: NavigateFunction) => {
    const res = await apiRequest<{ access_token: string }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(res.access_token);
    const me = await apiRequest<User>("/api/v1/auth/me");
    setUser(me);
    (nav || navigate)("/");
  };

  const register = async (body: { full_name: string; email: string; password: string; role?: string }) => {
    await apiRequest<User>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...body, role: body.role || "analyst" }),
    });
    await login(body.email, body.password);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    navigate("/login");
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page">Loading...</div>;
  if (!user) return <div className="page">Please login to continue.</div>;
  return <>{children}</>;
};
