"use client";
import { useState, useEffect, useCallback } from "react";
import { Building2, ChevronDown, Eye, X, AlertTriangle } from "lucide-react";
import { gymAPI } from "@/lib/api";

const STORAGE_KEY = "impersonating_gym";

/**
 * TenantSwitcher — super-admin read-only tenant impersonation switcher.
 *
 * When a gym is selected, stores { gymId, gymName } in sessionStorage
 * under the key "impersonating_gym". Gym-owner dashboard pages can
 * check for this key and show a read-only banner.
 */
export default function TenantSwitcher() {
  const [gyms,         setGyms]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [open,         setOpen]         = useState(false);
  const [impersonating,setImpersonating]= useState(null); // { gymId, gymName }

  // ── Load impersonation state from sessionStorage ───────────────
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setImpersonating(JSON.parse(stored));
    } catch (_) {}
  }, []);

  // ── Fetch active gyms ──────────────────────────────────────────
  const fetchGyms = useCallback(async () => {
    if (gyms.length > 0) return; // already loaded
    setLoading(true);
    try {
      const res = await gymAPI.getAll({ status: "active", limit: 100 });
      setGyms(res.data || []);
    } catch (_) {
      setGyms([]);
    } finally {
      setLoading(false);
    }
  }, [gyms.length]);

  const handleOpen = () => {
    setOpen(true);
    fetchGyms();
  };

  // ── Select a gym to impersonate ────────────────────────────────
  const handleSelect = (gym) => {
    const data = { gymId: gym._id, gymName: gym.name };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setImpersonating(data);
    setOpen(false);
  };

  // ── Exit impersonation ─────────────────────────────────────────
  const handleExit = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setImpersonating(null);
  };

  return (
    <div className="relative">
      {/* ── Impersonation Banner ── */}
      {impersonating ? (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2">
          <Eye size={14} className="text-amber-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 truncate max-w-[140px]">
            Viewing as: {impersonating.gymName}
          </span>
          <button
            onClick={handleExit}
            className="ml-1 p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded transition-colors cursor-pointer flex-shrink-0"
            title="Exit impersonation"
          >
            <X size={12} className="text-amber-600" />
          </button>
        </div>
      ) : (
        /* ── Trigger Button ── */
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm text-[var(--muted)] cursor-pointer"
        >
          <Building2 size={14} />
          <span className="hidden sm:inline">View as Tenant</span>
          <ChevronDown size={12} />
        </button>
      )}

      {/* ── Dropdown ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-violet-600" />
                <p className="text-sm font-semibold text-[var(--text)]">View as Tenant</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-[var(--surface2)] rounded-lg transition-colors cursor-pointer"
              >
                <X size={14} className="text-[var(--muted)]" />
              </button>
            </div>

            {/* Read-only notice */}
            <div className="flex items-start gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-800">
              <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Read-only mode. No changes will be made to tenant data.
              </p>
            </div>

            {/* Gym List */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <span className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                </div>
              ) : gyms.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--muted)]">
                  No active gyms found
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {gyms.map((gym) => (
                    <button
                      key={gym._id}
                      onClick={() => handleSelect(gym)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface2)] transition-colors text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(gym.name || "G")[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text)] truncate">{gym.name}</p>
                        <p className="text-xs text-[var(--muted)] truncate">{gym.city}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
