"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "@/lib/api";

const AuthContext = createContext();

// ── Token storage — TAB-ISOLATED ──────────────────────────────────
// Access token + user → sessionStorage (per-tab, not shared)
// Refresh token       → localStorage   (persists across tabs for "remember me")
//
// This prevents the cross-tab session bleed where admin in Tab 1
// overwrites the member session in Tab 2.

const TOKEN_KEY   = "fitzone_token";
const USER_KEY    = "fitzone_user";
const REFRESH_KEY = "fitzone_refresh";

const ss = () => (typeof window !== "undefined" ? window.sessionStorage : null);
const ls = () => (typeof window !== "undefined" ? window.localStorage  : null);

export const saveToken = (t) => {
  ss()?.setItem(TOKEN_KEY, t);
  // Also keep in localStorage as fallback for api.js which reads localStorage
  ls()?.setItem(TOKEN_KEY, t);
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  // sessionStorage first (tab-specific), then localStorage
  return ss()?.getItem(TOKEN_KEY) || ls()?.getItem(TOKEN_KEY) || null;
};

export const removeToken = () => {
  ss()?.removeItem(TOKEN_KEY);
  ss()?.removeItem(USER_KEY);
  ls()?.removeItem(TOKEN_KEY);
  ls()?.removeItem(REFRESH_KEY);
  ls()?.removeItem(USER_KEY);
};

// ── Normalize user — flatten gym object to primitive strings ───────
const normalizeUser = (userData) => {
  if (!userData) return null;
  const u = { ...userData };
  if (u.gym && typeof u.gym === "object") {
    u.gymId   = String(u.gym._id   || "");
    u.gymName = String(u.gym.name  || "");
    u.gymCity = String(u.gym.city  || "");
    u.gym     = String(u.gym._id   || "");
  }
  return u;
};

const saveUser = (userData) => {
  const normalized = normalizeUser(userData);
  if (normalized) {
    const json = JSON.stringify(normalized);
    // Store in sessionStorage (tab-isolated) — primary source
    ss()?.setItem(USER_KEY, json);
    // Also in localStorage so api.js identity check works
    ls()?.setItem(USER_KEY, json);
  }
  return normalized;
};

export function AuthProvider({ children }) {
  const [user,   setUser]   = useState(null);
  const [loaded, setLoaded] = useState(false);

  // ── Restore session on mount ───────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      // Check sessionStorage first — if this tab has its own token, use it
      const sessionToken = ss()?.getItem(TOKEN_KEY);

      if (sessionToken) {
        // This tab already has a session — validate it
        try {
          const data = await authAPI.getMe();
          const normalized = saveUser(data.user);
          setUser(normalized);
          setLoaded(true);
          return;
        } catch {
          // Session token invalid — clear this tab's session
          ss()?.removeItem(TOKEN_KEY);
          ss()?.removeItem(USER_KEY);
        }
      }

      // No session in this tab — don't inherit from localStorage
      // (prevents cross-tab session bleed)
      setUser(null);
      setLoaded(true);
    };

    restore();
  }, []);

  // ── Login ──────────────────────────────────────────────────────
  const loginUser = useCallback(async (email, password) => {
    // Clear THIS TAB's session only — don't touch other tabs
    ss()?.removeItem(TOKEN_KEY);
    ss()?.removeItem(USER_KEY);

    const data = await authAPI.login(email, password);

    if (data.accessToken) {
      // Save access token to sessionStorage (this tab only)
      ss()?.setItem(TOKEN_KEY, data.accessToken);
      // Also update localStorage so api.js can read it for this tab
      ls()?.setItem(TOKEN_KEY, data.accessToken);
      // Refresh token in localStorage (needed for token refresh)
      if (data.refreshToken) ls()?.setItem(REFRESH_KEY, data.refreshToken);
    }

    // Get populated user data
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
    // Only clear THIS TAB's session
    ss()?.removeItem(TOKEN_KEY);
    ss()?.removeItem(USER_KEY);
    ls()?.removeItem(TOKEN_KEY);
    ls()?.removeItem(REFRESH_KEY);
    ls()?.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // ── Silent refresh ─────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    const currentUserId = user?._id;
    try {
      const data = await authAPI.refreshToken();
      if (!data.accessToken) throw new Error("No token");

      // Verify identity
      if (data.userId && currentUserId && String(data.userId) !== String(currentUserId)) {
        ss()?.removeItem(TOKEN_KEY);
        ss()?.removeItem(USER_KEY);
        setUser(null);
        return false;
      }

      ss()?.setItem(TOKEN_KEY, data.accessToken);
      ls()?.setItem(TOKEN_KEY, data.accessToken);

      const me = await authAPI.getMe();
      if (currentUserId && me.user._id !== currentUserId) {
        ss()?.removeItem(TOKEN_KEY);
        ss()?.removeItem(USER_KEY);
        setUser(null);
        return false;
      }

      const normalized = saveUser(me.user);
      setUser(normalized);
      return true;
    } catch {
      ss()?.removeItem(TOKEN_KEY);
      ss()?.removeItem(USER_KEY);
      setUser(null);
      return false;
    }
  }, [user]);

  // ── Refresh user data from backend ───────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const data = await authAPI.getMe();
      const normalized = saveUser(data.user);
      setUser(normalized);
      return normalized;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loaded, loginUser, logoutUser, refreshSession, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
