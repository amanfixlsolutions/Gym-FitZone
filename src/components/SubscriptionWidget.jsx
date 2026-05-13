"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, CheckCircle, AlertTriangle, Clock, XCircle, ArrowUpRight } from "lucide-react";
import { paymentAPI } from "@/lib/api";

const TIER_CONFIG = {
  starter:    { label: "Starter",    color: "text-slate-600",   bg: "bg-slate-100 dark:bg-slate-800/40" },
  growth:     { label: "Growth",     color: "text-blue-600",    bg: "bg-blue-100 dark:bg-blue-900/30" },
  enterprise: { label: "Enterprise", color: "text-purple-600",  bg: "bg-purple-100 dark:bg-purple-900/30" },
  // Legacy plan names from paymentController
  Basic:        { label: "Basic",       color: "text-slate-600",  bg: "bg-slate-100 dark:bg-slate-800/40" },
  Professional: { label: "Professional",color: "text-blue-600",   bg: "bg-blue-100 dark:bg-blue-900/30" },
  Enterprise:   { label: "Enterprise",  color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
};

const STATUS_CONFIG = {
  trial:        { label: "Trial",        color: "text-amber-600",   bg: "bg-amber-100 dark:bg-amber-900/30",  icon: Clock },
  active:       { label: "Active",       color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: CheckCircle },
  grace_period: { label: "Grace Period", color: "text-orange-600",  bg: "bg-orange-100 dark:bg-orange-900/30", icon: AlertTriangle },
  expired:      { label: "Expired",      color: "text-red-600",     bg: "bg-red-100 dark:bg-red-900/30",    icon: XCircle },
  cancelled:    { label: "Cancelled",    color: "text-gray-500",    bg: "bg-gray-100 dark:bg-gray-800/40",  icon: XCircle },
};

function SkeletonLine({ w = "w-full", h = "h-3" }) {
  return <div className={`${w} ${h} bg-[var(--border)] rounded animate-pulse`} />;
}

export default function SubscriptionWidget() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    paymentAPI.gymSubStatus()
      .then(res => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const sub    = data?.subscription || {};
  const tier   = TIER_CONFIG[sub.plan] || TIER_CONFIG.starter;
  const status = STATUS_CONFIG[sub.status] || STATUS_CONFIG.trial;
  const StatusIcon = status.icon;

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard size={15} className="text-blue-600" />
          <p className="text-sm font-semibold text-[var(--text)]">Subscription</p>
        </div>
        <Link
          href="/gym-owner/subscription"
          className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          Manage <ArrowUpRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          <SkeletonLine w="w-1/2" />
          <SkeletonLine w="w-3/4" />
          <SkeletonLine w="w-2/3" />
        </div>
      ) : error ? (
        <p className="text-xs text-[var(--muted)]">Unable to load subscription info.</p>
      ) : (
        <>
          {/* Tier + Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.bg} ${tier.color}`}>
              {tier.label}
            </span>
            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
              <StatusIcon size={11} />
              {status.label}
            </span>
          </div>

          {/* Trial end date */}
          {sub.status === "trial" && sub.trialStartedAt && (
            <p className="text-xs text-[var(--muted)]">
              Trial started{" "}
              <span className="font-medium text-[var(--text)]">
                {formatDate(sub.trialStartedAt)}
              </span>
            </p>
          )}

          {/* Next billing / expiry */}
          {sub.expiryDate && sub.status !== "trial" && (
            <div className="text-xs text-[var(--muted)]">
              {sub.status === "active" ? "Renews" : "Expired"}{" "}
              <span className="font-medium text-[var(--text)]">{formatDate(sub.expiryDate)}</span>
              {sub.lastPaymentAmount > 0 && (
                <span className="ml-1 text-[var(--muted)]">
                  · ₹{sub.lastPaymentAmount.toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Billing cycle */}
          {sub.billingCycle && (
            <p className="text-xs text-[var(--muted)] capitalize">
              Billing: <span className="font-medium text-[var(--text)]">{sub.billingCycle}</span>
            </p>
          )}

          {/* Upgrade CTA */}
          {(sub.status === "trial" || sub.status === "expired" || !sub.status) && (
            <Link
              href="/gym-owner/subscription"
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <ArrowUpRight size={13} />
              Upgrade Plan
            </Link>
          )}
        </>
      )}
    </div>
  );
}
