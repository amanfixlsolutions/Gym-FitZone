"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { inventoryAPI } from "@/lib/api";
import { confirmToast, showSuccess, showError } from "@/lib/toast";
import {
  Plus, AlertTriangle, Edit2, Trash2, X, Check,
  Search, Package, RefreshCw,
} from "lucide-react";

const CATEGORIES = ["Supplements", "Accessories", "Equipment", "Apparel", "Beverages", "Other"];

const statusCls = {
  "In Stock":    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Low Stock":   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Out of Stock":"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const getStatus = (stock, minStock) => {
  if (stock === 0)           return "Out of Stock";
  if (stock <= minStock)     return "Low Stock";
  return "In Stock";
};

const EMPTY_FORM = {
  name: "", category: "Supplements", price: "",
  stock: "", minStock: "5", description: "",
};

export default function Page() {
  const [items,     setItems]     = useState([]);
  const [stats,     setStats]     = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [stockEdit, setStockEdit] = useState(null); // { id, value }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Fetch from backend ─────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 200 };
      if (catFilter !== "All") params.category = catFilter;
      if (search) params.search = search;

      const res = await inventoryAPI.getAll(params);
      setItems(res.data || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      if (!err.message?.includes("session") && !err.message?.includes("authorized")) {
        showError(err.message || "Failed to load inventory");
      }
    } finally {
      setLoading(false);
    }
  }, [catFilter, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Filtered locally for instant search ───────────────────────
  const filtered = useMemo(() => {
    if (!search && catFilter === "All") return items;
    return items.filter(item => {
      const matchSearch = !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "All" || item.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [items, search, catFilter]);

  // ── Open modals ────────────────────────────────────────────────
  const openAdd = () => {
    setEditId(null); setForm(EMPTY_FORM); setSuccess(false); setShowModal(true);
  };
  const openEdit = (item) => {
    setEditId(item._id);
    setForm({
      name:        item.name,
      category:    item.category,
      price:       String(item.price),
      stock:       String(item.stock),
      minStock:    String(item.minStock),
      description: item.description || "",
    });
    setSuccess(false); setShowModal(true);
  };

  // ── Submit (create or update) ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || form.stock === "") return;
    setSaving(true);

    const payload = {
      name:        form.name,
      category:    form.category,
      price:       Number(form.price),
      stock:       Number(form.stock),
      minStock:    Number(form.minStock) || 5,
      description: form.description,
    };

    try {
      if (editId) {
        const res = await inventoryAPI.update(editId, payload);
        setItems(p => p.map(i => i._id === editId ? res.data : i));
        // Refresh stats
        const statsRes = await inventoryAPI.getAll({ limit: 1 });
        if (statsRes.stats) setStats(statsRes.stats);
        showSuccess(`"${payload.name}" updated!`);
      } else {
        const res = await inventoryAPI.create(payload);
        setItems(p => [res.data, ...p]);
        setStats(p => ({ ...p, total: p.total + 1 }));
        showSuccess(`"${payload.name}" added to inventory!`);
      }
      setSaving(false); setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM); }, 1200);
    } catch (err) {
      showError(err.message || "Failed to save item");
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    const confirmed = await confirmToast(`Delete "${name}" from inventory?`);
    if (!confirmed) return;
    try {
      await inventoryAPI.delete(id);
      setItems(p => p.filter(i => i._id !== id));
      setStats(p => ({ ...p, total: Math.max(0, p.total - 1) }));
      showSuccess(`"${name}" removed.`);
    } catch (err) {
      showError(err.message || "Failed to delete item");
    }
  };

  // ── Inline stock update ────────────────────────────────────────
  const saveStockEdit = async (id) => {
    const val = parseInt(stockEdit?.value);
    if (isNaN(val) || val < 0) { setStockEdit(null); return; }
    try {
      const res = await inventoryAPI.updateStock(id, val);
      setItems(p => p.map(i => i._id === id ? res.data : i));
      showSuccess("Stock updated.");
    } catch (err) {
      showError(err.message || "Failed to update stock");
    }
    setStockEdit(null);
  };

  return (
    <RoleDashboardLayout title="Inventory" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Inventory</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Supplements, accessories and equipment stock</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchItems} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors" title="Refresh">
              <RefreshCw size={15} className="text-[var(--muted)]" />
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm">
              <Plus size={15} /> Add Item
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Items",   value: stats.total,      color: "text-[var(--text)]" },
            { label: "In Stock",      value: stats.inStock,    color: "text-emerald-600" },
            { label: "Low Stock",     value: stats.lowStock,   color: "text-amber-600" },
            { label: "Out of Stock",  value: stats.outOfStock, color: "text-red-500" },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${catFilter === cat ? "bg-blue-600 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  {["Item", "Category", "Price", "Stock", "Min Stock", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center">
                    <span className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--muted)]">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    {items.length === 0 ? "No items yet. Click \"Add Item\" to get started." : "No items match your search."}
                  </td></tr>
                ) : filtered.map(item => {
                  const status = item.status || getStatus(item.stock, item.minStock);
                  const isEditingStock = stockEdit?.id === item._id;

                  return (
                    <tr key={item._id} className="hover:bg-[var(--surface2)] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--text)] whitespace-nowrap">{item.name}</p>
                        {item.description && (
                          <p className="text-[10px] text-[var(--muted2)] mt-0.5 truncate max-w-[200px]">{item.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{item.category}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--text)] whitespace-nowrap">₹{item.price.toLocaleString()}</td>

                      {/* Inline stock edit */}
                      <td className="px-4 py-3">
                        {isEditingStock ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number" min="0"
                              value={stockEdit.value}
                              onChange={e => setStockEdit({ id: item._id, value: e.target.value })}
                              onKeyDown={e => { if (e.key === "Enter") saveStockEdit(item._id); if (e.key === "Escape") setStockEdit(null); }}
                              autoFocus
                              className="w-16 px-2 py-1 text-xs border border-blue-400 rounded-lg bg-[var(--surface2)] text-[var(--text)] focus:outline-none"
                            />
                            <button onClick={() => saveStockEdit(item._id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check size={12} /></button>
                            <button onClick={() => setStockEdit(null)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X size={12} /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setStockEdit({ id: item._id, value: String(item.stock) })}
                            className="flex items-center gap-1.5 hover:bg-[var(--surface2)] px-2 py-1 rounded-lg transition-colors group"
                            title="Click to edit stock"
                          >
                            {item.stock <= item.minStock && item.stock > 0 && <AlertTriangle size={12} className="text-amber-500" />}
                            <span className={`font-semibold ${item.stock === 0 ? "text-red-500" : item.stock <= item.minStock ? "text-amber-600" : "text-[var(--text)]"}`}>
                              {item.stock}
                            </span>
                            <Edit2 size={10} className="text-[var(--muted2)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3 text-[var(--muted)]">{item.minStock}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[status]}`}>{status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Edit">
                            <Edit2 size={14} className="text-blue-600" />
                          </button>
                          <button onClick={() => handleDelete(item._id, item.name)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[var(--border)] text-xs text-[var(--muted2)]">
              Showing {filtered.length} of {items.length} items
            </div>
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{editId ? "Edit Item" : "Add New Item"}</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">{editId ? "Update inventory item" : "Add item to your inventory"}</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="p-2 hover:bg-[var(--surface2)] rounded-lg">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-[var(--text)]">{editId ? "Item Updated!" : "Item Added!"}</p>
                <p className="text-sm text-[var(--muted)] mt-1">{form.name} has been {editId ? "updated" : "added"} successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Item Name <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Whey Protein (1kg)" value={form.name} onChange={e => set("name", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Category</label>
                  <select value={form.category} onChange={e => set("category", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                    <input required type="number" placeholder="499" min="0" value={form.price} onChange={e => set("price", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Current Stock <span className="text-red-500">*</span></label>
                    <input required type="number" placeholder="20" min="0" value={form.stock} onChange={e => set("stock", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Minimum Stock Alert</label>
                  <input type="number" placeholder="5" min="0" value={form.minStock} onChange={e => set("minStock", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <p className="text-[10px] text-[var(--muted2)] mt-1">Alert when stock falls below this number</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Description</label>
                  <textarea rows={2} placeholder="Brief description..." value={form.description} onChange={e => set("description", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                </div>

                {/* Live status preview */}
                {form.stock !== "" && (
                  <div className="flex items-center gap-2 bg-[var(--surface2)] rounded-xl px-4 py-3">
                    <span className="text-xs text-[var(--muted)]">Status preview:</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCls[getStatus(Number(form.stock), Number(form.minStock) || 5)]}`}>
                      {getStatus(Number(form.stock), Number(form.minStock) || 5)}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                    {saving ? "Saving..." : editId ? "Update Item" : "Add Item"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </RoleDashboardLayout>
  );
}
