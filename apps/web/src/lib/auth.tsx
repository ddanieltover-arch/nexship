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
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase";

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
    login: (email: string, password: string) => Promise<User>;
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

function roleFromSupabaseUser(sbUser: SupabaseUser): User["role"] {
  const appMetaRole = String(sbUser.app_metadata?.role ?? "").toUpperCase();
  const userMetaRole = String(sbUser.user_metadata?.role ?? "").toUpperCase();
  const role = appMetaRole || userMetaRole;
  if (role === "ADMIN" || role === "STAFF") return role;
  return "CUSTOMER";
}

function mapSupabaseUser(sbUser: SupabaseUser): User {
  return {
    id: sbUser.id,
    email: sbUser.email ?? "",
    name: (sbUser.user_metadata?.name as string | undefined) ?? null,
    role: roleFromSupabaseUser(sbUser),
  };
}

function mapSession(session: Session) {
  return {
    user: mapSupabaseUser(session.user),
    accessToken: session.access_token ?? null,
    refreshToken: session.refresh_token ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    let mounted = true;
    let authSub: { subscription: { unsubscribe: () => void } } | null = null;
    let sb: ReturnType<typeof getSupabaseClient>;
    try {
      sb = getSupabaseClient();
    } catch {
      if (mounted) {
        persist(null, null, null);
        setLoading(false);
      }
      return () => {
        mounted = false;
      };
    }
    void sb.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const session = data.session;
      if (session) {
        const mapped = mapSession(session);
        persist(mapped.user, mapped.accessToken, mapped.refreshToken);
      } else {
        persist(null, null, null);
      }
      setLoading(false);
    });

    const subData = sb.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        const mapped = mapSession(session);
        persist(mapped.user, mapped.accessToken, mapped.refreshToken);
      } else {
        persist(null, null, null);
      }
    });
    authSub = subData.data;

    return () => {
      mounted = false;
      authSub?.subscription.unsubscribe();
    };
  }, [persist]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.session) throw new Error("No session returned from Supabase.");
      const mapped = mapSession(data.session);
      persist(mapped.user, mapped.accessToken, mapped.refreshToken);
      return mapped.user;
    },
    [persist]
  );

  const register = useCallback(
    async (input: { email: string; password: string; name: string; phone?: string }) => {
      const { data, error } = await getSupabaseClient().auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            name: input.name,
            phone: input.phone,
            role: "CUSTOMER",
          },
        },
      });
      if (error) throw new Error(error.message);
      if (data.session) {
        const mapped = mapSession(data.session);
        persist(mapped.user, mapped.accessToken, mapped.refreshToken);
      }
    },
    [persist]
  );

  const refresh = useCallback(async () => {
    const { data, error } = await getSupabaseClient().auth.refreshSession();
    if (error) throw new Error(error.message);
    if (data.session) {
      const mapped = mapSession(data.session);
      persist(mapped.user, mapped.accessToken, mapped.refreshToken);
    }
  }, [persist]);

  const logout = useCallback(async () => {
    await getSupabaseClient().auth.signOut();
    persist(null, null, null);
  }, [persist]);

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
