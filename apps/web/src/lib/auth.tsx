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
    void (async () => {
      const s = loadStored();
      if (!s?.accessToken || !s.refreshToken || !s.user) {
        if (mounted) setLoading(false);
        return;
      }

      // #region agent log
      fetch('http://127.0.0.1:7481/ingest/ce8de074-f5d2-447d-ae80-ffb58579b81c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d0882'},body:JSON.stringify({sessionId:'2d0882',runId:'run4',hypothesisId:'H7',location:'web/lib/auth.tsx:bootstrap:start',message:'Auth bootstrap with stored session',data:{hasStoredUser:Boolean(s.user),accessLen:s.accessToken.length,refreshLen:s.refreshToken.length},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      try {
        const me = await apiFetch<{ user: User }>("/auth/me", { token: s.accessToken });
        if (!mounted) return;
        persist(me.user, s.accessToken, s.refreshToken);
        // #region agent log
        fetch('http://127.0.0.1:7481/ingest/ce8de074-f5d2-447d-ae80-ffb58579b81c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d0882'},body:JSON.stringify({sessionId:'2d0882',runId:'run4',hypothesisId:'H7',location:'web/lib/auth.tsx:bootstrap:meOk',message:'Stored access token is valid',data:{role:me.user.role},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      } catch {
        // #region agent log
        fetch('http://127.0.0.1:7481/ingest/ce8de074-f5d2-447d-ae80-ffb58579b81c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d0882'},body:JSON.stringify({sessionId:'2d0882',runId:'run4',hypothesisId:'H8',location:'web/lib/auth.tsx:bootstrap:meFail',message:'Stored access token rejected, trying refresh',data:{},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        try {
          const refreshed = await apiFetch<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refreshToken: s.refreshToken }),
          });
          const me = await apiFetch<{ user: User }>("/auth/me", { token: refreshed.accessToken });
          if (!mounted) return;
          persist(me.user, refreshed.accessToken, refreshed.refreshToken);
          // #region agent log
          fetch('http://127.0.0.1:7481/ingest/ce8de074-f5d2-447d-ae80-ffb58579b81c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d0882'},body:JSON.stringify({sessionId:'2d0882',runId:'run4',hypothesisId:'H8',location:'web/lib/auth.tsx:bootstrap:refreshOk',message:'Refresh succeeded and user restored',data:{role:me.user.role},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        } catch {
          if (!mounted) return;
          persist(null, null, null);
          // #region agent log
          fetch('http://127.0.0.1:7481/ingest/ce8de074-f5d2-447d-ae80-ffb58579b81c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d0882'},body:JSON.stringify({sessionId:'2d0882',runId:'run4',hypothesisId:'H8',location:'web/lib/auth.tsx:bootstrap:refreshFail',message:'Refresh failed, cleared local session',data:{},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [persist]);

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
