"use client";

import * as React from "react";

import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { clearToken, getToken, setToken } from "@/lib/auth/token";

type User = components["schemas"]["UserRead"];
type UserRole = components["schemas"]["UserRole"];

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
  ) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("loading");

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      // Synchronizing with an external system (localStorage) on mount, not
      // derivable render state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unauthenticated");
      return;
    }

    api.GET("/api/v1/auth/me").then(({ data, error }) => {
      if (error || !data) {
        clearToken();
        setStatus("unauthenticated");
        return;
      }
      setUser(data);
      setStatus("authenticated");
    });
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const { data, error } = await api.POST("/api/v1/auth/login", {
      body: { email, password },
    });
    if (error || !data) {
      return { error: "Incorrect email or password." };
    }
    setToken(data.access_token);
    setUser(data.user);
    setStatus("authenticated");
    return {};
  }, []);

  const register = React.useCallback(
    async (email: string, password: string, fullName: string, role: UserRole) => {
      const { data, error } = await api.POST("/api/v1/auth/register", {
        body: { email, password, full_name: fullName, role },
      });
      if (error || !data) {
        const detail = (error as { detail?: string } | undefined)?.detail;
        return { error: detail ?? "Couldn't create your account. Try a different email." };
      }
      setToken(data.access_token);
      setUser(data.user);
      setStatus("authenticated");
      return {};
    },
    [],
  );

  const logout = React.useCallback(() => {
    clearToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
