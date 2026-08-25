"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { PublicUser } from "@/lib/types";

interface RegisterInput {
  name?: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: PublicUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  register: (input: RegisterInput) => Promise<PublicUser>;
  login: (input: LoginInput) => Promise<PublicUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface UserResponse {
  data: { user: PublicUser };
}

function loginRequest(email: string, password: string): Promise<UserResponse> {
  return api<UserResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  useEffect(() => {
    let cancelled = false;

    api<UserResponse>("/api/auth/me")
      .then(({ data }) => {
        if (!cancelled) {
          setUser(data.user);
          setStatus("authenticated");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function register(input: RegisterInput): Promise<PublicUser> {
    // The register endpoint does not issue a session; log the user in right away.
    await api("/api/auth/register", { method: "POST", body: input });
    return login({ email: input.email, password: input.password });
  }

  async function login(input: LoginInput): Promise<PublicUser> {
    const { data } = await loginRequest(input.email, input.password);
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }

  async function logout(): Promise<void> {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }

  const value: AuthContextValue = { user, status, register, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
