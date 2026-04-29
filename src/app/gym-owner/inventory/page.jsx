"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { Plus, AlertTriangle, Edit2 } from "lucide-react";
import { iconBg, iconText } from "@/lib/colorMap";

const items = [
  { id: "I001", name: "Whey Protein (1kg)",     category: "Supplements", price: "₹2,499", stock: 24, minStock: 10, status: "In Stock" },
  { id: "I002", name: "Creatine Monohydrate",   category: "Supplements", price: "₹899",   stock: 8,  minStock: 10, status: "Low Stock" },
  { id: "I003", name: "Gym Gloves",             category: "Accessories", price: "₹349",   stock: 35, minStock: 15, status: "In Stock" },
  { id: "I004", name: "Resistance Bands (Set)", category: "Equipment",   price: "₹599",   stock: 12, minStock: 8,  status: "In Stock" },
  { id: "I005", name: "Shaker Bottle",          category: "Accessories", price: "₹249",   stock: 3,  minStock: 10, status: "Low Stock" },
  { id: "I006", name: "Pre-Workout (300g)",     category: "Supplements", price: "₹1,299", stock: 0,  minStock: 5,  status: "Out of Stock" },
];
const statusCls = { "In Stock": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", "Low Stock": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", "Out of Stock": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };

export default function Page() {
  return (
    <RoleDashboardLayout title="Inventory" navItems={GYM_OWNER_NAV} role="gym-owner" userName="Suresh Nair" userEmail="suresh@ironparadise.in" userAvatar="SN">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Inventory</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Supplements, accessories and equipment stock</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm w-fit"><Plus size={15} /> Add Item</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ label: "Total Items", value: "6" }, { label: "In Stock", value: "4" }, { label: "Low Stock", value: "2" }, { label: "Out of Stock", value: "1" }].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>{["ID", "Item", "Category", "Price", "Stock", "Min Stock", "Status", ""].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{item.id}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{item.name}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{item.category}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">{item.price}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {item.stock <= item.minStock && item.stock > 0 && <AlertTriangle size={13} className="text-amber-500" />}
                        <span className={`font-semibold ${item.stock === 0 ? "text-red-500" : item.stock <= item.minStock ? "text-amber-600" : "text-[var(--text)]"}`}>{item.stock}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{item.minStock}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[item.status]}`}>{item.status}</span></td>
                    <td className="px-4 py-3"><button className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 size={14} className="text-blue-600" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
