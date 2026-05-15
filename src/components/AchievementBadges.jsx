"use client";
import { Star, Zap, Target, TrendingUp, Calendar, Trophy, Lock, Check } from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// Badge definitions — must match backend BADGE_THRESHOLDS
// ─────────────────────────────────────────────────────────────────
const BADGE_DEFS = [
  {
    name:    "First Step",
    icon:    Star,
    color:   "bg-amber-100 text-amber-600",
    earnedBg: "border-amber-200",
    desc:    "Complete your first gym check-in",
    type:    "checkins",
    count:   1,
    hint:    (remaining) => `${remaining} more check-in${remaining !== 1 ? "s" : ""} needed`,
  },
  {
    name:    "Getting Started",
    icon:    Zap,
    color:   "bg-blue-100 text-blue-600",
    earnedBg: "border-blue-200",
    desc:    "Reach 10 total check-ins",
    type:    "checkins",
    count:   10,
    hint:    (remaining) => `${remaining} more check-in${remaining !== 1 ? "s" : ""} needed`,
  },
  {
    name:    "Committed",
    icon:    Target,
    color:   "bg-emerald-100 text-emerald-600",
    earnedBg: "border-emerald-200",
    desc:    "Reach 50 total check-ins",
    type:    "checkins",
    count:   50,
    hint:    (remaining) => `${remaining} more check-in${remaining !== 1 ? "s" : ""} needed`,
  },
  {
    name:    "Centurion",
    icon:    TrendingUp,
    color:   "bg-purple-100 text-purple-600",
    earnedBg: "border-purple-200",
    desc:    "Reach 100 total check-ins",
    type:    "checkins",
    count:   100,
    hint:    (remaining) => `${remaining} more check-in${remaining !== 1 ? "s" : ""} needed`,
  },
  {
    name:    "Anniversary",
    icon:    Calendar,
    color:   "bg-rose-100 text-rose-600",
    earnedBg: "border-rose-200",
    desc:    "Be a member for 365 days",
    type:    "membership_days",
    count:   365,
    hint:    (remaining) => `${remaining} more day${remaining !== 1 ? "s" : ""} of membership needed`,
  },
  {
    name:    "Loyal Member",
    icon:    Trophy,
    color:   "bg-orange-100 text-orange-600",
    earnedBg: "border-orange-200",
    desc:    "Renew your membership plan",
    type:    "plan_renewal",
    count:   1,
    hint:    () => "Renew your plan to earn this badge",
  },
];

// ─────────────────────────────────────────────────────────────────
// AchievementBadges
// Props: { achievements = [], totalCheckins = 0, joinDate = null }
// ─────────────────────────────────────────────────────────────────
export default function AchievementBadges({ achievements = [], totalCheckins = 0, joinDate = null }) {
  // Build a lookup map: badge name → awardedAt
  const earnedMap = {};
  (achievements || []).forEach(a => {
    if (a.badge) earnedMap[a.badge] = a.awardedAt;
  });

  // Calculate membership days
  const membershipDays = joinDate
    ? Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const earnedCount = BADGE_DEFS.filter(b => earnedMap[b.name] !== undefined).length;
  const totalCount  = BADGE_DEFS.length;
  const pct         = Math.round((earnedCount / totalCount) * 100);

  const fmtDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const getRemaining = (def) => {
    if (def.type === "checkins") {
      return Math.max(0, def.count - (totalCheckins || 0));
    }
    if (def.type === "membership_days") {
      return Math.max(0, def.count - membershipDays);
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-gray-600">{earnedCount} of {totalCount} badges earned</p>
          <p className="text-xs font-bold text-amber-600">{pct}%</p>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BADGE_DEFS.map((def) => {
          const earned    = earnedMap[def.name] !== undefined;
          const awardedAt = earnedMap[def.name];
          const remaining = getRemaining(def);
          const Icon      = def.icon;

          return (
            <div
              key={def.name}
              className={`bg-white rounded-2xl p-4 border-2 transition-all ${
                earned
                  ? `${def.earnedBg} hover:shadow-lg hover:scale-[1.02]`
                  : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  earned ? def.color : "bg-gray-100 text-gray-400"
                }`}>
                  <Icon size={20} />
                  {/* Earned checkmark overlay */}
                  {earned && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check size={9} className="text-white" strokeWidth={3} />
                    </span>
                  )}
                  {/* Locked overlay */}
                  {!earned && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                      <Lock size={8} className="text-white" strokeWidth={3} />
                    </span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-gray-800">{def.name}</h3>
                    {earned && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        ✓ Earned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{def.desc}</p>
                  {earned && awardedAt ? (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                      Awarded {fmtDate(awardedAt)}
                    </p>
                  ) : (
                    remaining !== null && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        🔒 {def.hint(remaining)}
                      </p>
                    )
                  )}
                  {!earned && def.type === "plan_renewal" && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      🔒 {def.hint(0)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
