"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Award, Star, Zap, Target, TrendingUp, Calendar, Loader2, Trophy } from "lucide-react";

const ACHIEVEMENTS = [
  { icon: Star,       title: "First Workout",     desc: "Completed your first gym session",          color: "bg-amber-100 text-amber-600",   earned: true  },
  { icon: Zap,        title: "7-Day Streak",       desc: "Visited the gym 7 days in a row",           color: "bg-blue-100 text-blue-600",     earned: false },
  { icon: Target,     title: "Goal Setter",        desc: "Set your first fitness goal",               color: "bg-emerald-100 text-emerald-600", earned: true },
  { icon: TrendingUp, title: "Progress Maker",     desc: "Logged 10+ check-ins",                      color: "bg-purple-100 text-purple-600", earned: false },
  { icon: Calendar,   title: "Monthly Champion",   desc: "Attended classes every week for a month",   color: "bg-rose-100 text-rose-600",     earned: false },
  { icon: Trophy,     title: "Elite Member",       desc: "Active member for 6+ months",               color: "bg-orange-100 text-orange-600", earned: false },
];

export default function AchievementsPage() {
  const { user, loaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loaded && !user) router.push("/login");
  }, [loaded, user, router]);

  if (!loaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const earned = ACHIEVEMENTS.filter(a => a.earned).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-6 text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Award size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">My Achievements</h1>
              <p className="text-amber-100 text-sm mt-0.5">{earned} of {ACHIEVEMENTS.length} unlocked</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(earned / ACHIEVEMENTS.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-amber-100 mt-1">{Math.round((earned / ACHIEVEMENTS.length) * 100)}% complete</p>
          </div>
        </div>

        {/* Achievements grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACHIEVEMENTS.map((a, i) => (
            <div key={i} className={`bg-white rounded-2xl p-5 shadow-md border-2 transition-all ${
              a.earned ? "border-amber-200 hover:shadow-lg" : "border-gray-100 opacity-60"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${a.color}`}>
                  <a.icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-800">{a.title}</h3>
                    {a.earned && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        ✓ Earned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          More achievements coming soon! Keep working out to unlock them.
        </p>
      </div>
    </div>
  );
}
