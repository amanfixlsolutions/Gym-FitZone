import { CheckCircle, XCircle, Clock, UserPlus, CreditCard, AlertTriangle } from "lucide-react";

const activities = [
  {
    icon: UserPlus,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "New gym registered",
    desc: "FitLife Studio – Delhi",
    time: "2 min ago",
  },
  {
    icon: CreditCard,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Payment received",
    desc: "Rahul Sharma – ₹2,999 (Quarterly)",
    time: "15 min ago",
  },
  {
    icon: CheckCircle,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Gym approved",
    desc: "CrossFit Arena – Kolkata",
    time: "1 hr ago",
  },
  {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Review flagged",
    desc: "Inappropriate content reported",
    time: "2 hr ago",
  },
  {
    icon: XCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    title: "Payment failed",
    desc: "Priya Mehta – ₹1,499",
    time: "3 hr ago",
  },
  {
    icon: Clock,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    title: "Membership paused",
    desc: "Amit Kumar – 30 days pause",
    time: "5 hr ago",
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">Recent Activity</p>
        <button className="text-xs text-blue-600 font-medium hover:text-blue-700">
          View all
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {activities.map((item, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
              <item.icon size={15} className={item.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 leading-tight">{item.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{item.desc}</p>
            </div>
            <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
