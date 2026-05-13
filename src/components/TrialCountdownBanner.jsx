"use client";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, X } from "lucide-react";
import { useState } from "react";

/**
 * TrialCountdownBanner
 * Props: { trialEndsAt, subscriptionStatus }
 * Only renders when subscriptionStatus === 'trial' and trialEndsAt is set.
 */
export default function TrialCountdownBanner({ trialEndsAt, subscriptionStatus }) {
  const [dismissed, setDismissed] = useState(false);

  // Only show for trial status
  if (subscriptionStatus !== "trial" || !trialEndsAt || dismissed) return null;

  const now      = new Date();
  const end      = new Date(trialEndsAt);
  const msLeft   = end.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const expired  = daysLeft <= 0;

  if (expired) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            Trial Expired — upgrade to keep your gym active.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/gym-owner/subscription"
            className="flex items-center gap-1 text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Upgrade Now <ArrowUpRight size={12} />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  const urgency = daysLeft <= 3 ? "red" : daysLeft <= 7 ? "orange" : "amber";

  const colors = {
    red:    { banner: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",    icon: "text-red-600",    text: "text-red-700 dark:text-red-400",    btn: "bg-red-600 hover:bg-red-700" },
    orange: { banner: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800", icon: "text-orange-600", text: "text-orange-700 dark:text-orange-400", btn: "bg-orange-600 hover:bg-orange-700" },
    amber:  { banner: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",   icon: "text-amber-600",  text: "text-amber-700 dark:text-amber-400",  btn: "bg-amber-600 hover:bg-amber-700" },
  }[urgency];

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 border rounded-xl ${colors.banner}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className={`${colors.icon} flex-shrink-0`} />
        <p className={`text-sm font-semibold ${colors.text}`}>
          Your trial ends in{" "}
          <strong>{daysLeft} {daysLeft === 1 ? "day" : "days"}</strong>
          {" "}— upgrade to avoid interruption.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/gym-owner/subscription"
          className={`flex items-center gap-1 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-colors ${colors.btn}`}
        >
          Upgrade Now <ArrowUpRight size={12} />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className={`p-1 ${colors.icon} opacity-60 hover:opacity-100 transition-opacity`}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
