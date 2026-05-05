"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "@/lib/api";

const AuthContext = createContext();

// ── Token storage ──────────────────────────────────────────────────
const TOKEN_KEY = "fitzone_token";
const USER_KEY  = "fitzone_user";

export const saveToken   = (t) => { if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t); };
export const getToken    = ()  => { if (typeof window === "undefined") return null; return localStorage.getItem(TOKEN_KEY); };
export const removeToken = ()  => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("fitzone_refresh");
    localStorage.removeItem(USER_KEY);
  }
};

// ── Normalize user — flatten gym object to primitive strings ───────
// Backend populates gym as {_id, name, city, status, logo}
// React cannot render objects as children, so we extract the fields
const normalizeUser = (userData) => {
  if (!userData) return null;
  const u = { ...userData };
  if (u.gym && typeof u.gym === "object") {
    u.gymId   = String(u.gym._id   || "");
    u.gymName = String(u.gym.name  || "");
    u.gymCity = String(u.gym.city  || "");
    u.gym     = String(u.gym._id   || ""); // keep as ID string
  }
  return u;
};

const saveUser = (userData) => {
  const normalized = normalizeUser(userData);
  if (normalized) localStorage.setItem(USER_KEY, JSON.stringify(normalized));
  return normalized;
};

export function AuthProvider({ children }) {
  const [user,   setUser]   = useState(null);
  const [loaded, setLoaded] = useState(false);

  // ── Restore session on mount ───────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const token = getToken();

      const tryRefresh = async () => {
        const refreshTok = localStorage.getItem("fitzone_refresh");
        if (!refreshTok) return false;

        // Get current user ID before refresh to validate identity
        const currentUserId = (() => {
          try {
            const cached = localStorage.getItem(USER_KEY);
            return cached ? JSON.parse(cached)?._id : null;
          } catch { return null; }
        })();

        try {
          const refreshData = await authAPI.refreshToken();
          if (!refreshData.accessToken) return false;
          saveToken(refreshData.accessToken);

          const meData = await authAPI.getMe();
          const freshUser = meData.user;

          // ── Identity check — if user changed, reject the session ──
          if (currentUserId && freshUser._id !== currentUserId) {
            removeToken();
            setUser(null);
            return false;
          }

          const normalized = saveUser(freshUser);
          setUser(normalized);
          return true;
        } catch {
          return false;
        }
      };

      if (!token) {
        const ok = await tryRefresh();
        if (!ok) { removeToken(); setUser(null); }
        setLoaded(true);
        return;
      }

      try {
        // Always fetch fresh user from backend — never trust localStorage cache alone
        const data = await authAPI.getMe();
        const normalized = saveUser(data.user);
        setUser(normalized);
      } catch {
        // Access token expired — try refresh
        const ok = await tryRefresh();
        if (!ok) { removeToken(); setUser(null); }
      } finally {
        setLoaded(true);
      }
    };

    restore();
  }, []);

  // ── Login ──────────────────────────────────────────────────────
  const loginUser = useCallback(async (email, password) => {
    // Clear any existing session first — prevents stale tokens from
    // a previous user (e.g. admin) bleeding into the new session
    removeToken();

    const data = await authAPI.login(email, password);

    if (data.accessToken) {
      saveToken(data.accessToken);
      if (data.refreshToken) localStorage.setItem("fitzone_refresh", data.refreshToken);
    }

    // Login response has gym as ObjectId string (not populated)
    // Call getMe to get the populated version
    let userData = data.user;
    try {
      const meData = await authAPI.getMe();
      userData = meData.user;
    } catch {}

    const normalized = saveUser(userData);
    setUser(normalized);
    return normalized;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────
  const logoutUser = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    removeToken();
    setUser(null);
  }, []);

  // ── Silent refresh ─────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    const currentUserId = user?._id;
    try {
      const data = await authAPI.refreshToken();
      if (!data.accessToken) throw new Error("No token");
      saveToken(data.accessToken);

      const me = await authAPI.getMe();

      // Identity check — if user changed, force logout
      if (currentUserId && me.user._id !== currentUserId) {
        removeToken();
        setUser(null);
        return false;
      }

      const normalized = saveUser(me.user);
      setUser(normalized);
      return true;
    } catch {
      removeToken();
      setUser(null);
      return false;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loaded, loginUser, logoutUser, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
