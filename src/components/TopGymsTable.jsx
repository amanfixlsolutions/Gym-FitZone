import { Star, MoreHorizontal } from "lucide-react";
import Link from "next/link";

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626"];

const statusColors = {
  active:    "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  pending:   "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  suspended: "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400",
};

export default function TopGymsTable({ data }) {
  const gyms = data?.length ? data : [];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <p className="text-sm font-semibold text-[var(--text)]">Top Performing Gyms</p>
        <Link href="/super-admin/gyms" className="text-xs text-violet-600 font-medium hover:text-violet-700">
          View all →
        </Link>
      </div>

      {gyms.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-[var(--muted)]">No gym data yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
                {["Gym Name", "Members", "Revenue", "Rating", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gyms.map((gym, i) => (
                <tr key={gym._id || i} className="border-b border-[var(--border)] hover:bg-[var(--surface2)] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: COLORS[i % COLORS.length] }}>
                        {(gym.name || "G").charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)] text-sm leading-tight">{gym.name}</p>
                        <p className="text-xs text-[var(--muted)]">{gym.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[var(--text)]">
                    {(gym.totalMembers || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-emerald-600">
                      {gym.monthlyRevenue >= 100000
                        ? `₹${(gym.monthlyRevenue / 100000).toFixed(2)}L`
                        : `₹${(gym.monthlyRevenue || 0).toLocaleString()}`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="font-medium text-[var(--text)]">{(gym.rating || 0).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[gym.status] || statusColors.active}`}>
                      {gym.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
