"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { superAdminAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";
import { Settings, RefreshCw, Building2, Search, Save } from "lucide-react";

const FLAG_KEYS = [
  "member_self_registration",
  "live_classes",
  "zoom_integration",
  "campaigns",
  "inventory",
  "analytics_advanced",
  "api_access",
];

const FLAG_LABELS = {
  member_self_registration: "Self-Reg",
  live_classes:             "Live Classes",
  zoom_integration:         "Zoom",
  campaigns:                "Campaigns",
  inventory:                "Inventory",
  analytics_advanced:       "Analytics+",
  api_access:               "API Access",
};

// ── Toggle Switch ──────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer disabled:opacity-40 ${
        checked ? "bg-violet-600" : "bg-[var(--border)]"
      }`}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

const tierConfig = {
  starter:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  growth:     "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  enterprise: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function FeatureFlagsPage() {
  const [tenants,  setTenants]  = useState([]);
  const [flags,    setFlags]    = useState({}); // { [gymId]: { [flagKey]: bool } }
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState({}); // { [gymId]: bool }
  const [search,   setSearch]   = useState("");

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getTenants({ limit: 100 });
      const data = res.data || [];
      setTenants(data);

      // Fetch feature flags for each tenant via detail endpoint
      const flagMap = {};
      await Promise.all(
        data.map(async (t) => {
          try {
            const detail = await superAdminAPI.getTenantDetail(t._id);
            flagMap[t._id] = detail.data?.tenantConfig?.featureFlags || {};
          } catch (_) {
            flagMap[t._id] = {};
          }
        })
      );
      setFlags(flagMap);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  // ── Toggle a single flag ───────────────────────────────────────
  const handleToggle = (gymId, flagKey) => {
    setFlags((prev) => ({
      ...prev,
      [gymId]: {
        ...prev[gymId],
        [flagKey]: !prev[gymId]?.[flagKey],
      },
    }));
  };

  // ── Save flags for a single tenant ────────────────────────────
  const handleSave = async (gymId, gymName) => {
    setSaving((prev) => ({ ...prev, [gymId]: true }));
    try {
      await superAdminAPI.updateFeatureFlags(gymId, flags[gymId] || {});
      showSuccess(`Feature flags saved for ${gymName}.`);
    } catch (err) {
      showError(err.message || "Failed to save feature flags");
    } finally {
      setSaving((prev) => ({ ...prev, [gymId]: false }));
    }
  };

  // ── Filter tenants by search ───────────────────────────────────
  const filtered = tenants.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.city?.toLowerCase().includes(q)
    );
  });

  return (
    <RoleDashboardLayout title="Feature Flags" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Feature Flag Management</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Enable or disable features per tenant
            </p>
          </div>
          <button
            onClick={fetchTenants}
            className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
          <input
            type="text"
            placeholder="Search gyms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]"
          />
        </div>

        {/* ── Table ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: "900px" }}>
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide whitespace-nowrap sticky left-0 bg-[var(--surface2)]">
                    Gym Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide whitespace-nowrap">
                    Tier
                  </th>
                  {FLAG_KEYS.map((key) => (
                    <th
                      key={key}
                      className="text-center px-3 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide whitespace-nowrap"
                    >
                      {FLAG_LABELS[key]}
                    </th>
                  ))}
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide whitespace-nowrap">
                    Save
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan={FLAG_KEYS.length + 3} className="px-4 py-10 text-center">
                      <span className="inline-block w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={FLAG_KEYS.length + 3} className="px-4 py-10 text-center text-sm text-[var(--muted)]">
                      <Building2 size={32} className="mx-auto mb-2 opacity-30" />
                      No tenants found
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const gymFlags = flags[t._id] || {};
                    const isSaving = saving[t._id];
                    const tierCls = tierConfig[t.subscriptionTier] || tierConfig.starter;

                    return (
                      <tr key={t._id} className="hover:bg-[var(--surface2)] transition-colors">
                        {/* Gym Name */}
                        <td className="px-4 py-3 sticky left-0 bg-[var(--surface)] hover:bg-[var(--surface2)]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(t.name || "G")[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[var(--text)] truncate max-w-[120px]">{t.name}</p>
                              <p className="text-[10px] text-[var(--muted)] truncate">{t.city}</p>
                            </div>
                          </div>
                        </td>

                        {/* Tier */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${tierCls}`}>
                            {t.subscriptionTier || "starter"}
                          </span>
                        </td>

                        {/* Feature Flag Toggles */}
                        {FLAG_KEYS.map((key) => (
                          <td key={key} className="px-3 py-3 text-center">
                            <div className="flex justify-center">
                              <Toggle
                                checked={!!gymFlags[key]}
                                onChange={() => handleToggle(t._id, key)}
                                disabled={isSaving}
                              />
                            </div>
                          </td>
                        ))}

                        {/* Save Button */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSave(t._id, t.name)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors cursor-pointer"
                          >
                            {isSaving
                              ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                              : <Save size={11} />}
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[var(--border)] text-xs text-[var(--muted2)]">
              Showing {filtered.length} of {tenants.length} tenants
            </div>
          )}
        </div>

        {/* ── Legend ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings size={14} className="text-[var(--muted)]" />
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Feature Descriptions</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {FLAG_KEYS.map((key) => (
              <div key={key} className="bg-[var(--surface2)] rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-[var(--text)]">{FLAG_LABELS[key]}</p>
                <p className="text-[10px] text-[var(--muted)] mt-0.5 capitalize">
                  {key.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </RoleDashboardLayout>
  );
}
