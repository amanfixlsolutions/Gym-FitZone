"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Award, Loader2 } from "lucide-react";
import { memberAPI } from "@/lib/api";
import AchievementBadges from "@/components/AchievementBadges";

const BG = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80";

export default function AchievementsPage() {
  const { user, loaded } = useAuth();
  const router = useRouter();

  const [memberData, setMemberData] = useState(null);
  const [fetching,   setFetching]   = useState(false);

  useEffect(() => {
    if (loaded && !user) router.push("/login");
  }, [loaded, user, router]);

  // Fetch member record to get achievements, totalCheckins, joinDate
  useEffect(() => {
    if (!user) return;
    const fetchMember = async () => {
      setFetching(true);
      try {
        // Try /members/self first (Task 7.10 endpoint)
        const res = await memberAPI.getSelf();
        if (res?.data) {
          setMemberData(res.data);
          return;
        }
      } catch (_) { /* fall through */ }

      // Fallback: search by email
      try {
        const res = await memberAPI.getAll({ search: user.email, limit: 1 });
        const members = res?.data || [];
        const match = members.find(
          m => m.email?.toLowerCase() === user.email?.toLowerCase()
        );
        if (match) setMemberData(match);
      } catch (_) { /* silent */ }

      setFetching(false);
    };
    fetchMember();
  }, [user]);

  if (!loaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const achievements  = memberData?.achievements  || [];
  const totalCheckins = memberData?.totalCheckins  || 0;
  const joinDate      = memberData?.joinDate       || user?.createdAt || null;

  const earnedCount = achievements.length;
  const totalCount  = 6; // total badge definitions

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
                <p className="text-amber-100 text-sm mt-0.5">
                  {fetching ? "Loading…" : `${earnedCount} of ${totalCount} unlocked`}
                </p>
              </div>
            </div>
            {!fetching && (
              <div className="mt-4">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((earnedCount / totalCount) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-amber-100 mt-1">
                  {Math.round((earnedCount / totalCount) * 100)}% complete
                </p>
              </div>
            )}
          </div>

          {/* Loading state */}
          {fetching ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : (
            <AchievementBadges
              achievements={achievements}
              totalCheckins={totalCheckins}
              joinDate={joinDate}
            />
          )}

          <p className="text-center text-xs text-white/50 mt-6">
            Check in regularly to unlock more badges!
          </p>
        </div>
      </div>
    </div>
  );
}
