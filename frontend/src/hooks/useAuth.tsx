import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

type User = { id: number; full_name: string; email: string; role: string };

type AuthContextValue = {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { full_name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      axios
        .get("/api/v1/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => logout());
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await axios.post("/api/v1/auth/login", { email, password });
    setToken(res.data.access_token);
    localStorage.setItem("token", res.data.access_token);
  };

  const register = async (payload: { full_name: string; email: string; password: string }) => {
    await axios.post("/api/v1/auth/register", { ...payload, role: "analyst" });
    await login(payload.email, payload.password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common.Authorization;
  };

  return <AuthContext.Provider value={{ token, user, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
