import { Star, MoreHorizontal } from "lucide-react";

const gyms = [
  {
    id: "#G1009",
    name: "Iron Paradise Fitness",
    location: "Andheri, Mumbai",
    members: 2310,
    revenue: "₹1,24,839",
    rating: 5.0,
    status: "Active",
  },
  {
    id: "#G1001",
    name: "PowerHouse Gym",
    location: "Koramangala, Bangalore",
    members: 1230,
    revenue: "₹92,662",
    rating: 4.8,
    status: "Active",
  },
  {
    id: "#G1004",
    name: "FitLife Studio",
    location: "Connaught Place, Delhi",
    members: 812,
    revenue: "₹74,048",
    rating: 4.7,
    status: "Active",
  },
  {
    id: "#G1002",
    name: "Zen Yoga & Wellness",
    location: "Banjara Hills, Hyderabad",
    members: 645,
    revenue: "₹62,820",
    rating: 4.5,
    status: "Pending",
  },
  {
    id: "#G1003",
    name: "CrossFit Arena",
    location: "Salt Lake, Kolkata",
    members: 572,
    revenue: "₹48,734",
    rating: 4.5,
    status: "Active",
  },
];

const statusColors = {
  Active: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  Suspended: "bg-red-50 text-red-500",
};

export default function TopGymsTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">Top Performing Gyms</p>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                ID
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Gym Name
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Members
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Revenue
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Rating
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {gyms.map((gym, i) => (
              <tr
                key={gym.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">
                  {gym.id}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{
                        background: [
                          "#2563eb",
                          "#7c3aed",
                          "#059669",
                          "#d97706",
                          "#dc2626",
                        ][i],
                      }}
                    >
                      {gym.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm leading-tight">
                        {gym.name}
                      </p>
                      <p className="text-xs text-gray-400">{gym.location}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-medium text-gray-700">
                  {gym.members.toLocaleString()}
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-emerald-600">
                    {gym.revenue}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium text-gray-700">{gym.rating.toFixed(1)}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      statusColors[gym.status]
                    }`}
                  >
                    {gym.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
