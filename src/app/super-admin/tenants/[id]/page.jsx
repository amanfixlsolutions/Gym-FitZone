"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { superAdminAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";
import {
  ArrowLeft, Building2, Users, CreditCard, Activity,
  Settings, RefreshCw, CheckCircle, XCircle, Clock,
  MapPin, Mail, Phone, Calendar, Zap,
} from "lucide-react";

const fmtMoney = (v = 0) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(2)}L` : `₹${v.toLocaleString()}`;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const statusConfig = {
  active:    { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Active" },
  trial:     { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",             label: "Trial" },
  expired:   { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",                 label: "Expired" },
  suspended: { cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",                label: "Suspended" },
  pending:   { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",         label: "Pending" },
};

const FEATURE_FLAG_LABELS = {
  member_self_registration: "Member Self-Registration",
  live_classes:             "Live Classes",
  zoom_integration:         "Zoom Integration",
  campaigns:                "Campaigns",
  inventory:                "Inventory",
  analytics_advanced:       "Advanced Analytics",
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
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
        checked ? "bg-violet-600" : "bg-[var(--border)]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

export default function TenantDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [tenant,       setTenant]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [actionId,     setActionId]     = useState(null);
  const [flagsSaving,  setFlagsSaving]  = useState(false);
  const [localFlags,   setLocalFlags]   = useState({});

  const fetchTenant = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getTenantDetail(id);
      const data = res.data || null;
      setTenant(data);
      // Initialize local flags from tenantConfig
      if (data?.tenantConfig?.featureFlags) {
        setLocalFlags({ ...data.tenantConfig.featureFlags });
      }
    } catch (err) {
      showError("Failed to load tenant details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTenant(); }, [fetchTenant]);

  // ── Suspend ────────────────────────────────────────────────────
  const handleSuspend = async () => {
    setActionId("suspend");
    try {
      await superAdminAPI.suspendTenant(id);
      showSuccess("Gym suspended.");
      fetchTenant();
    } catch (err) {
      showError(err.message || "Failed to suspend");
    } finally {
      setActionId(null);
    }
  };

  // ── Reactivate ─────────────────────────────────────────────────
  const handleReactivate = async () => {
    setActionId("reactivate");
    try {
      await superAdminAPI.reactivateTenant(id);
      showSuccess("Gym reactivated!");
      fetchTenant();
    } catch (err) {
      showError(err.message || "Failed to reactivate");
    } finally {
      setActionId(null);
    }
  };

  // ── Extend Trial ───────────────────────────────────────────────
  const handleExtendTrial = async () => {
    setActionId("trial");
    try {
      await superAdminAPI.extendTrial(id, 7);
      showSuccess("Trial extended by 7 days.");
      fetchTenant();
    } catch (err) {
      showError(err.message || "Failed to extend trial");
    } finally {
      setActionId(null);
    }
  };

  // ── Save Feature Flags ─────────────────────────────────────────
  const handleSaveFlags = async () => {
    setFlagsSaving(true);
    try {
      await superAdminAPI.updateFeatureFlags(id, localFlags);
      showSuccess("Feature flags updated.");
    } catch (err) {
      showError(err.message || "Failed to update feature flags");
    } finally {
      setFlagsSaving(false);
    }
  };

  const toggleFlag = (key) => {
    setLocalFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <RoleDashboardLayout title="Tenant Detail" navItems={SUPER_ADMIN_NAV} role="super-admin">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-[var(--surface2)] rounded w-40 mb-3" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-12 bg-[var(--surface2)] rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </RoleDashboardLayout>
    );
  }

  if (!tenant) {
    return (
      <RoleDashboardLayout title="Tenant Detail" navItems={SUPER_ADMIN_NAV} role="super-admin">
        <div className="text-center py-16 text-[var(--muted)]">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>Tenant not found.</p>
        </div>
      </RoleDashboardLayout>
    );
  }

  const sc = statusConfig[tenant.status] || statusConfig.pending;
  const subStatus = tenant.subscription?.status || "trial";
  const subSc = statusConfig[subStatus] || statusConfig.trial;

  return (
    <RoleDashboardLayout title={tenant.name} navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} className="text-[var(--muted)]" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[var(--text)]">{tenant.name}</h1>
            <p className="text-sm text-[var(--muted)]">{tenant.city}</p>
          </div>
          <button
            onClick={fetchTenant}
            className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className="text-[var(--muted)]" />
          </button>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap gap-2">
          {tenant.status === "active" && (
            <button
              onClick={handleSuspend}
              disabled={actionId === "suspend"}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm font-semibold rounded-lg hover:bg-red-200 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {actionId === "suspend"
                ? <span className="w-4 h-4 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                : <XCircle size={14} />}
              Suspend Gym
            </button>
          )}
          {(tenant.status === "suspended" || tenant.status === "rejected") && (
            <button
              onClick={handleReactivate}
              disabled={actionId === "reactivate"}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {actionId === "reactivate"
                ? <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                : <CheckCircle size={14} />}
              Reactivate
            </button>
          )}
          {subStatus === "trial" && (
            <button
              onClick={handleExtendTrial}
              disabled={actionId === "trial"}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-semibold rounded-lg hover:bg-blue-200 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {actionId === "trial"
                ? <span className="w-4 h-4 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                : <Clock size={14} />}
              Extend Trial +7 days
            </button>
          )}
        </div>

        {/* ── Section 1: Gym Profile ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border)]">
            <Building2 size={15} className="text-violet-600" />
            <p className="font-semibold text-[var(--text)]">Gym Profile</p>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-black flex-shrink-0">
                {(tenant.name || "G")[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{tenant.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.cls}`}>
                    {sc.label}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 capitalize">
                    {tenant.subscriptionTier || "starter"}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: MapPin,    label: "City",    value: tenant.city || "—" },
                { icon: Mail,      label: "Email",   value: tenant.email || "—" },
                { icon: Phone,     label: "Phone",   value: tenant.phone || "—" },
                { icon: Users,     label: "Owner",   value: tenant.owner?.name || tenant.ownerName || "—" },
                { icon: Calendar,  label: "Joined",  value: fmtDate(tenant.createdAt) },
                { icon: Calendar,  label: "Approved",value: fmtDate(tenant.approvedAt) },
              ].map((f) => (
                <div key={f.label} className="bg-[var(--surface2)] rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <f.icon size={11} className="text-[var(--muted2)]" />
                    <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">{f.label}</p>
                  </div>
                  <p className="text-sm font-medium text-[var(--text)] truncate">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 2: Subscription Details ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border)]">
            <CreditCard size={15} className="text-emerald-600" />
            <p className="font-semibold text-[var(--text)]">Subscription Details</p>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Sub Status",    value: subSc.label,                                    badge: subSc.cls },
              { label: "Billing Cycle", value: tenant.subscription?.billingCycle || "—" },
              { label: "Expiry Date",   value: fmtDate(tenant.subscription?.expiryDate) },
              { label: "Last Payment",  value: fmtDate(tenant.subscription?.lastPaidAt) },
              { label: "Last Amount",   value: tenant.subscription?.lastPaymentAmount ? fmtMoney(tenant.subscription.lastPaymentAmount) : "—" },
              { label: "Days Left",     value: tenant.daysUntilExpiry !== null ? `${tenant.daysUntilExpiry}d` : "—" },
            ].map((f) => (
              <div key={f.label} className="bg-[var(--surface2)] rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">{f.label}</p>
                {f.badge ? (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.badge}`}>{f.value}</span>
                ) : (
                  <p className="text-sm font-medium text-[var(--text)]">{f.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: Usage Stats ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border)]">
            <Users size={15} className="text-blue-600" />
            <p className="font-semibold text-[var(--text)]">Usage Stats</p>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Members",   value: (tenant.totalMembers  || 0).toLocaleString() },
              { label: "Active Members",  value: (tenant.activeMembers || 0).toLocaleString() },
              { label: "Total Trainers",  value: (tenant.totalTrainers || 0).toLocaleString() },
              { label: "Total Revenue",   value: fmtMoney(tenant.totalRevenue || 0) },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--surface2)] rounded-xl px-4 py-4 text-center">
                <p className="text-2xl font-bold text-[var(--text)]">{s.value}</p>
                <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: Feature Flags ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Settings size={15} className="text-amber-600" />
              <p className="font-semibold text-[var(--text)]">Feature Flags</p>
            </div>
            <button
              onClick={handleSaveFlags}
              disabled={flagsSaving}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {flagsSaving
                ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                : <Zap size={12} />}
              Save Changes
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(FEATURE_FLAG_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between bg-[var(--surface2)] rounded-xl px-4 py-3"
              >
                <p className="text-sm text-[var(--text)]">{label}</p>
                <Toggle
                  checked={!!localFlags[key]}
                  onChange={() => toggleFlag(key)}
                  disabled={flagsSaving}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 5: Recent Activity ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border)]">
            <Activity size={15} className="text-violet-600" />
            <p className="font-semibold text-[var(--text)]">Recent Activity</p>
            <span className="text-xs text-[var(--muted)]">(last 20 entries)</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {!tenant.recentActivity?.length ? (
              <div className="px-5 py-8 text-center text-sm text-[var(--muted)]">
                <Activity size={24} className="mx-auto mb-2 opacity-30" />
                No activity recorded yet
              </div>
            ) : (
              tenant.recentActivity.map((log, i) => (
                <div key={log._id || i} className="flex items-start gap-3 px-5 py-3 hover:bg-[var(--surface2)] transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    log.status === "failed" ? "bg-red-500" : "bg-emerald-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)]">
                      {log.action?.replace(/_/g, " ")}
                    </p>
                    {log.details && (
                      <p className="text-xs text-[var(--muted)] truncate">{log.details}</p>
                    )}
                    <p className="text-xs text-[var(--muted2)] mt-0.5">
                      {log.userName} · {log.role} ·{" "}
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    log.status === "failed"
                      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  }`}>
                    {log.module}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </RoleDashboardLayout>
  );
}
