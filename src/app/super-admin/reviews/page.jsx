import DashboardLayout from "@/components/DashboardLayout";
import { Star, Flag, CheckCircle, Trash2, ThumbsUp } from "lucide-react";

const reviews = [
  { id: "R001", member: "Rahul Sharma", gym: "Iron Paradise", rating: 5, text: "Amazing gym! Great equipment and very clean. The trainers are super helpful.", date: "Jan 27, 2025", status: "Published", helpful: 12 },
  { id: "R002", member: "Priya Mehta", gym: "PowerHouse Gym", rating: 4, text: "Good gym overall. Could improve the locker room facilities.", date: "Jan 26, 2025", status: "Published", helpful: 8 },
  { id: "R003", member: "Amit Kumar", gym: "FitLife Studio", rating: 2, text: "Not happy with the service. Staff was rude and equipment was broken.", date: "Jan 25, 2025", status: "Flagged", helpful: 3 },
  { id: "R004", member: "Sneha Patel", gym: "Zen Yoga", rating: 5, text: "Best yoga studio in the city! Meera is an incredible instructor.", date: "Jan 24, 2025", status: "Published", helpful: 21 },
  { id: "R005", member: "Vikram Singh", gym: "CrossFit Arena", rating: 3, text: "Decent gym but gets too crowded during peak hours.", date: "Jan 23, 2025", status: "Pending", helpful: 5 },
];

const statusCls = {
  Published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Flagged:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Pending:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function Stars({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={13} className={i <= count ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <DashboardLayout title="Reviews">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Reviews & Ratings</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Moderate member reviews across all gyms</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Reviews", value: "8,432" },
            { label: "Published", value: "7,890" },
            { label: "Flagged", value: "124" },
            { label: "Avg. Rating", value: "4.6 ★" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {r.member.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[var(--text)] text-sm">{r.member}</p>
                      <span className="text-xs text-[var(--muted)]">→</span>
                      <p className="text-sm text-blue-600 font-medium">{r.gym}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Stars count={r.rating} />
                      <span className="text-xs text-[var(--muted)]">{r.date}</span>
                    </div>
                    <p className="text-sm text-[var(--text-2)] leading-relaxed">{r.text}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--muted)]">
                      <ThumbsUp size={12} /> {r.helpful} found helpful
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCls[r.status]}`}>
                    {r.status}
                  </span>
                  <button className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Approve">
                    <CheckCircle size={15} className="text-emerald-500" />
                  </button>
                  <button className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Flag">
                    <Flag size={15} className="text-amber-500" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
