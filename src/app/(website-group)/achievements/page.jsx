"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Award, Star, Zap, Target, TrendingUp, Calendar, Loader2, Trophy } from "lucide-react";

const BG = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80";

const ACHIEVEMENTS = [
  { icon: Star,       title: "First Workout",     desc: "Completed your first gym session",        color: "bg-amber-100 text-amber-600",    earned: true  },
  { icon: Zap,        title: "7-Day Streak",       desc: "Visited the gym 7 days in a row",         color: "bg-blue-100 text-blue-600",      earned: false },
  { icon: Target,     title: "Goal Setter",        desc: "Set your first fitness goal",             color: "bg-emerald-100 text-emerald-600",earned: true  },
  { icon: TrendingUp, title: "Progress Maker",     desc: "Logged 10+ check-ins",                    color: "bg-purple-100 text-purple-600",  earned: false },
  { icon: Calendar,   title: "Monthly Champion",   desc: "Attended classes every week for a month", color: "bg-rose-100 text-rose-600",      earned: false },
  { icon: Trophy,     title: "Elite Member",       desc: "Active member for 6+ months",             color: "bg-orange-100 text-orange-600",  earned: false },
];

export default function AchievementsPage() {
  const { user, loaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loaded && !user) router.push("/login");
  }, [loaded, user, router]);

  if (!loaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const earned = ACHIEVEMENTS.filter(a => a.earned).length;

  return (
    <div className="min-h-screen pb-12" style={{ backgroundImage: `url('${BG}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="min-h-screen" style={{ background: "rgba(0,0,0,0.68)" }}>
        <div className="container mx-auto px-4 max-w-2xl pt-24">

          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 sm:p-6 mb-6 text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Award size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black">My Achievements</h1>
                <p className="text-amber-100 text-sm mt-0.5">{earned} of {ACHIEVEMENTS.length} unlocked</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(earned / ACHIEVEMENTS.length) * 100}%` }} />
              </div>
              <p className="text-xs text-amber-100 mt-1">{Math.round((earned / ACHIEVEMENTS.length) * 100)}% complete</p>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ACHIEVEMENTS.map((a, i) => (
              <div key={i} className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xl border-2 transition-all ${
                a.earned ? "border-amber-200 hover:shadow-2xl hover:scale-[1.02]" : "border-gray-100 opacity-60"
              }`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${a.color}`}>
                    <a.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-800">{a.title}</h3>
                      {a.earned && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">✓ Earned</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-white/50 mt-6">More achievements coming soon!</p>
        </div>
      </div>
    </div>
  );
}
