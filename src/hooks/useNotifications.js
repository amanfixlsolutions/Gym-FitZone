"use client";
/**
 * useNotifications — unified notification system
 *
 * Provides real-time notifications via Socket.io with a 30-second
 * polling fallback. Works across all three role dashboards.
 *
 * Usage:
 *   const { notifs, unreadCount, markRead, markAllRead, refresh } = useNotifications();
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { notificationAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const POLL_INTERVAL_MS = 30_000; // 30-second polling fallback

export function useNotifications({ limit = 20 } = {}) {
  const { user } = useAuth();
  const [notifs,      setNotifs]      = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading,     setLoading]     = useState(false);
  const socketRef     = useRef(null);
  const pollRef       = useRef(null);
  const mountedRef    = useRef(true);

  // ── Fetch notifications from backend ──────────────────────────
  const fetchNotifs = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.getAll({ limit });
      if (!mountedRef.current) return;
      setNotifs(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      /* silent — polling will retry */
    }
  }, [user, limit]);

  // ── Mark single notification as read ──────────────────────────
  const markRead = useCallback(async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  }, []);

  // ── Mark all as read ───────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  }, []);

  // ── Socket.io real-time connection ────────────────────────────
  const connectSocket = useCallback(() => {
    if (!user || socketRef.current) return;

    // Dynamically import socket.io-client to avoid SSR issues
    import("socket.io-client").then(({ io }) => {
      const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
                         "https://fitzone-backend-vis3.onrender.com";

      const token = typeof window !== "undefined"
        ? (window.sessionStorage?.getItem("fitzone_token") ||
           window.localStorage?.getItem("fitzone_token"))
        : null;

      const socket = io(SOCKET_URL, {
        auth:          { token },
        transports:    ["websocket", "polling"],
        reconnection:  true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
        timeout:       10000,
      });

      socket.on("connect", () => {
        // Join gym room for gym-scoped notifications
        if (user.gym) socket.emit("join", `gym:${user.gym}`);
        // Join user room for personal notifications
        socket.emit("join", `user:${user._id}`);
      });

      // ── Real-time notification events ──────────────────────────
      socket.on("notification", (notif) => {
        if (!mountedRef.current) return;
        setNotifs(prev => {
          // Avoid duplicates
          if (prev.some(n => n._id === notif._id)) return prev;
          return [notif, ...prev].slice(0, limit);
        });
        setUnreadCount(c => c + 1);
      });

      // ── Real-time check-in event (gym-owner dashboard) ─────────
      socket.on("checkin", () => {
        // Refresh notifications on new check-in
        fetchNotifs();
      });

      socket.on("disconnect", () => {
        // Socket disconnected — polling fallback will keep data fresh
      });

      socket.on("connect_error", () => {
        // Connection failed — polling fallback handles it
        socket.disconnect();
        socketRef.current = null;
      });

      socketRef.current = socket;
    }).catch(() => {
      // socket.io-client not available — polling only
    });
  }, [user, limit, fetchNotifs]);

  // ── Start polling fallback ─────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(fetchNotifs, POLL_INTERVAL_MS);
  }, [fetchNotifs]);

  // ── Lifecycle ─────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    if (!user) {
      setNotifs([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    fetchNotifs().finally(() => {
      if (mountedRef.current) setLoading(false);
    });

    connectSocket();
    startPolling();

    return () => {
      mountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [user, fetchNotifs, connectSocket, startPolling]);

  return {
    notifs,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refresh: fetchNotifs,
  };
}
