"use client";
import { Users, UserCheck, AlertTriangle } from "lucide-react";

/**
 * UsageMeters
 * Props: { totalMembers, maxMembers, totalTrainers, maxTrainers }
 */
export default function UsageMeters({ totalMembers = 0, maxMembers = 100, totalTrainers = 0, maxTrainers = 10 }) {
  const memberPct  = Math.min(Math.round((totalMembers  / (maxMembers  || 1)) * 100), 100);
  const trainerPct = Math.min(Math.round((totalTrainers / (maxTrainers || 1)) * 100), 100);

  const getBarColor = (pct) => {
    if (pct >= 90) return "bg-red-500";
    if (pct >= 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getTextColor = (pct) => {
    if (pct >= 90) return "text-red-600";
    if (pct >= 70) return "text-amber-600";
    return "text-emerald-600";
  };

  const Meter = ({ icon: Icon, label, current, max, pct }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon size={13} className="text-[var(--muted)]" />
          <span className="text-xs font-medium text-[var(--text)]">{label}</span>
          {pct >= 90 && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-600">
              <AlertTriangle size={10} /> Approaching limit
            </span>
          )}
        </div>
        <span className={`text-xs font-bold ${getTextColor(pct)}`}>
          {current} / {max} <span className="font-normal text-[var(--muted)]">({pct}%)</span>
        </span>
      </div>
      {/* Progress bar track */}
      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(pct)}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} usage: ${pct}%`}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-4">
      <p className="text-sm font-semibold text-[var(--text)]">Plan Usage</p>
      <Meter
        icon={Users}
        label="Members"
        current={totalMembers}
        max={maxMembers}
        pct={memberPct}
      />
      <Meter
        icon={UserCheck}
        label="Trainers"
        current={totalTrainers}
        max={maxTrainers}
        pct={trainerPct}
      />
    </div>
  );
}
