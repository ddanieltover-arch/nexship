"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "./api";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
};

const AuthContext = createContext<
  AuthState & {
    login: (email: string, password: string) => Promise<void>;
    register: (input: {
      email: string;
      password: string;
      name: string;
      phone?: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
  }
>(null as never);

const STORAGE_KEY = "veloroute_auth";

function loadStored(): Pick<AuthState, "accessToken" | "refreshToken" | "user"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Pick<AuthState, "accessToken" | "refreshToken" | "user">;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = loadStored();
    if (s?.accessToken && s.refreshToken && s.user) {
      setAccessToken(s.accessToken);
      setRefreshToken(s.refreshToken);
      setUser(s.user);
    }
    setLoading(false);
  }, []);

  const persist = useCallback(
    (u: User | null, access: string | null, refresh: string | null) => {
      setUser(u);
      setAccessToken(access);
      setRefreshToken(refresh);
      if (typeof window === "undefined") return;
      if (u && access && refresh) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, accessToken: access, refreshToken: refresh }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      persist(res.user, res.accessToken, res.refreshToken);
    },
    [persist]
  );

  const register = useCallback(
    async (input: { email: string; password: string; name: string; phone?: string }) => {
      const res = await apiFetch<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>("/auth/register", { method: "POST", body: JSON.stringify(input) });
      persist(res.user, res.accessToken, res.refreshToken);
    },
    [persist]
  );

  const refresh = useCallback(async () => {
    const rt = refreshToken ?? loadStored()?.refreshToken;
    if (!rt) return;
    const res = await apiFetch<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: rt }),
    });
    setAccessToken(res.accessToken);
    setRefreshToken(res.refreshToken);
    const u = user ?? loadStored()?.user;
    if (u) persist(u, res.accessToken, res.refreshToken);
  }, [persist, refreshToken, user]);

  const logout = useCallback(async () => {
    const at = accessToken;
    const rt = refreshToken;
    try {
      if (at) {
        await apiFetch("/auth/logout", {
          method: "POST",
          token: at,
          body: JSON.stringify(rt ? { refreshToken: rt } : {}),
        });
      }
    } catch {
      /* ignore */
    }
    persist(null, null, null);
  }, [accessToken, refreshToken, persist]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      loading,
      login,
      register,
      logout,
      refresh,
    }),
    [user, accessToken, refreshToken, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
