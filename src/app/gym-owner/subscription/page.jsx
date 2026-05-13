"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { paymentAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle, CreditCard, RefreshCw, Loader2, AlertTriangle,
  ArrowUpRight, Calendar, Clock, Zap,
} from "lucide-react";

// ── Platform plan definitions ──────────────────────────────────────
const PLANS = [
  {
    id: "Basic",
    tier: "starter",
    label: "Starter",
    monthly: 999,
    yearly: 9590,
    color: "from-slate-500 to-slate-600",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    features: [
      "Up to 100 members",
      "Up to 10 trainers",
      "Basic analytics",
      "Email support",
      "QR check-in",
    ],
  },
  {
    id: "Professional",
    tier: "growth",
    label: "Growth",
    monthly: 2499,
    yearly: 23990,
    color: "from-blue-500 to-indigo-600",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    popular: true,
    features: [
      "Up to 500 members",
      "Up to 30 trainers",
      "Advanced analytics",
      "Priority support",
      "Live classes",
      "Campaign tools",
      "Custom branding",
    ],
  },
  {
    id: "Enterprise",
    tier: "enterprise",
    label: "Enterprise",
    monthly: 4999,
    yearly: 47990,
    color: "from-purple-500 to-violet-600",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    features: [
      "Unlimited members",
      "Unlimited trainers",
      "Full analytics suite",
      "Dedicated support",
      "All features",
      "API access",
      "White-label option",
    ],
  },
];

// Load Razorpay script
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

export default function SubscriptionPage() {
  const { user } = useAuth();

  const [subData,      setSubData]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [paying,       setPaying]       = useState(null); // plan id being paid
  const [payError,     setPayError]     = useState("");
  const [paySuccess,   setPaySuccess]   = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.gymSubStatus();
      setSubData(res.data);
    } catch {
      setSubData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const sub = subData?.subscription || {};
  const currentPlan = PLANS.find(p => p.id === sub.plan) || null;

  // ── Initiate Razorpay payment ──────────────────────────────────
  const handleUpgrade = useCallback(async (plan) => {
    setPayError("");
    setPaying(plan.id);
    try {
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        setPayError("Failed to load payment gateway. Please try again.");
        setPaying(null);
        return;
      }

      const amount = billingCycle === "yearly" ? plan.yearly : plan.monthly;
      const orderRes = await paymentAPI.gymSubCreateOrder({ plan: plan.id, billingCycle });
      const { orderId, currency, keyId, gymName } = orderRes.data;

      const options = {
        key:         keyId,
        amount:      amount * 100,
        currency:    currency || "INR",
        name:        "FitZone Platform",
        description: `${plan.label} Plan — ${billingCycle}`,
        order_id:    orderId,
        prefill: {
          name:  user?.name  || "",
          email: user?.email || "",
        },
        notes: { gymName, plan: plan.id, billingCycle },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            await paymentAPI.gymSubVerify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan:                plan.id,
              billingCycle,
            });
            setPaySuccess(plan.label);
            setPaying(null);
            fetchStatus();
          } catch (err) {
            setPayError(err.message || "Payment verification failed.");
            setPaying(null);
          }
        },
        modal: {
          ondismiss: () => setPaying(null),
          escape: false,
          backdropclose: false,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        setPayError(r.error?.description || "Payment failed. Please try again.");
        setPaying(null);
      });
      rzp.open();
    } catch (err) {
      setPayError(err.message || "Failed to initiate payment.");
      setPaying(null);
    }
  }, [billingCycle, user, fetchStatus]);

  return (
    <RoleDashboardLayout title="Subscription" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* ── Payment success banner ── */}
        {paySuccess && (
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              🎉 Successfully upgraded to <strong>{paySuccess}</strong> plan!
            </p>
            <button onClick={() => setPaySuccess(null)} className="ml-auto text-emerald-500 hover:text-emerald-700 text-xs">✕</button>
          </div>
        )}

        {/* ── Error banner ── */}
        {payError && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{payError}</p>
            <button onClick={() => setPayError("")} className="ml-auto text-red-400 hover:text-red-600 text-xs">✕</button>
          </div>
        )}

        {/* ── Current subscription card ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-blue-600" />
              <h2 className="font-semibold text-[var(--text)]">Current Subscription</h2>
            </div>
            <button
              onClick={fetchStatus}
              className="p-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--muted)] transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-4 bg-[var(--border)] rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[var(--muted)] text-xs mb-0.5">Plan</p>
                <p className="font-semibold text-[var(--text)]">{sub.plan || "—"}</p>
              </div>
              <div>
                <p className="text-[var(--muted)] text-xs mb-0.5">Status</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full capitalize
                  ${sub.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : sub.status === "trial"  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                  {sub.status || "trial"}
                </span>
              </div>
              <div>
                <p className="text-[var(--muted)] text-xs mb-0.5">Billing Cycle</p>
                <p className="font-semibold text-[var(--text)] capitalize">{sub.billingCycle || "—"}</p>
              </div>
              <div>
                <p className="text-[var(--muted)] text-xs mb-0.5">Expiry Date</p>
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-[var(--muted)]" />
                  <p className="font-semibold text-[var(--text)]">{formatDate(sub.expiryDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-[var(--muted)] text-xs mb-0.5">Last Payment</p>
                <p className="font-semibold text-[var(--text)]">
                  {sub.lastPaymentAmount ? `₹${sub.lastPaymentAmount.toLocaleString()}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[var(--muted)] text-xs mb-0.5">Last Paid</p>
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-[var(--muted)]" />
                  <p className="font-semibold text-[var(--text)]">{formatDate(sub.lastPaidAt)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Billing cycle toggle ── */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[var(--text)]">Choose a Plan</h2>
          <div className="inline-flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-full p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${billingCycle === "monthly" ? "bg-blue-600 text-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${billingCycle === "yearly" ? "bg-blue-600 text-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
            >
              Yearly <span className="text-emerald-500 ml-1">Save ~20%</span>
            </button>
          </div>
        </div>

        {/* ── Plan comparison table ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = sub.plan === plan.id && sub.status === "active";
            const price = billingCycle === "yearly" ? plan.yearly : plan.monthly;
            const isLoading = paying === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative bg-[var(--surface)] border rounded-xl overflow-hidden transition-all
                  ${plan.popular ? "border-blue-500 shadow-lg shadow-blue-500/10" : "border-[var(--border)]"}
                  ${isCurrent ? "ring-2 ring-emerald-500" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 left-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg">
                    Current Plan
                  </div>
                )}

                <div className={`h-1.5 bg-gradient-to-r ${plan.color}`} />

                <div className="p-5 space-y-4">
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.badge}`}>
                      {plan.label}
                    </span>
                    <div className="mt-3">
                      <span className="text-2xl font-black text-[var(--text)]">
                        ₹{price.toLocaleString()}
                      </span>
                      <span className="text-xs text-[var(--muted)] ml-1">
                        /{billingCycle === "yearly" ? "year" : "month"}
                      </span>
                    </div>
                    {billingCycle === "yearly" && (
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        ≈ ₹{Math.round(price / 12).toLocaleString()}/mo
                      </p>
                    )}
                  </div>

                  <ul className="space-y-1.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div className="w-full py-2.5 text-center text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      ✓ Active Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={!!paying}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      {isLoading ? (
                        <><Loader2 size={13} className="animate-spin" /> Processing...</>
                      ) : (
                        <><Zap size={13} /> {sub.plan ? "Switch Plan" : "Upgrade"} <ArrowUpRight size={12} /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Billing history ── */}
        {sub.lastPaidAt && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--text)] text-sm">Billing History</h3>
            </div>
            <div className="divide-y divide-[var(--border)]">
              <div className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-[var(--text)]">{sub.plan} — {sub.billingCycle}</p>
                  <p className="text-xs text-[var(--muted)]">{formatDate(sub.lastPaidAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--text)]">₹{(sub.lastPaymentAmount || 0).toLocaleString()}</p>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                    Paid
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
