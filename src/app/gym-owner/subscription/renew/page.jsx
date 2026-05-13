"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { paymentAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle, CreditCard, Loader2, AlertTriangle,
  ArrowLeft, RefreshCw, Calendar,
} from "lucide-react";

const PLAN_PRICES = {
  Basic:        { monthly: 999,  yearly: 9590  },
  Professional: { monthly: 2499, yearly: 23990 },
  Enterprise:   { monthly: 4999, yearly: 47990 },
};

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

export default function RenewSubscriptionPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [subData,      setSubData]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [paying,       setPaying]       = useState(false);
  const [payError,     setPayError]     = useState("");

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.gymSubStatus();
      setSubData(res.data);
      // Default to current billing cycle
      if (res.data?.subscription?.billingCycle) {
        setBillingCycle(res.data.subscription.billingCycle);
      }
    } catch {
      setSubData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const sub     = subData?.subscription || {};
  const planId  = sub.plan || "Basic";
  const prices  = PLAN_PRICES[planId] || PLAN_PRICES.Basic;
  const amount  = billingCycle === "yearly" ? prices.yearly : prices.monthly;

  const handleRenew = useCallback(async () => {
    setPayError("");
    setPaying(true);
    try {
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        setPayError("Failed to load payment gateway. Please try again.");
        setPaying(false);
        return;
      }

      const orderRes = await paymentAPI.gymSubCreateOrder({ plan: planId, billingCycle });
      const { orderId, currency, keyId } = orderRes.data;

      const options = {
        key:         keyId,
        amount:      amount * 100,
        currency:    currency || "INR",
        name:        "FitZone Platform",
        description: `${planId} Plan Renewal — ${billingCycle}`,
        order_id:    orderId,
        prefill: {
          name:  user?.name  || "",
          email: user?.email || "",
        },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            await paymentAPI.gymSubVerify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan:                planId,
              billingCycle,
            });
            // Redirect to subscription page on success
            router.push("/gym-owner/subscription");
          } catch (err) {
            setPayError(err.message || "Payment verification failed.");
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
          escape: false,
          backdropclose: false,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        setPayError(r.error?.description || "Payment failed. Please try again.");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setPayError(err.message || "Failed to initiate payment.");
      setPaying(false);
    }
  }, [planId, billingCycle, amount, user, router]);

  return (
    <RoleDashboardLayout title="Renew Subscription" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Back link */}
        <button
          onClick={() => router.push("/gym-owner/subscription")}
          className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={15} /> Back to Subscription
        </button>

        {/* Error */}
        {payError && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{payError}</p>
            <button onClick={() => setPayError("")} className="ml-auto text-red-400 hover:text-red-600 text-xs">✕</button>
          </div>
        )}

        {/* Current status card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={15} className="text-blue-600" />
              <h2 className="font-semibold text-[var(--text)]">Current Status</h2>
            </div>
            <button onClick={fetchStatus} className="p-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--muted)] transition-colors">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2].map(i => <div key={i} className="h-4 bg-[var(--border)] rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[var(--muted)] text-xs mb-0.5">Plan</p>
                <p className="font-semibold text-[var(--text)]">{sub.plan || "—"}</p>
              </div>
              <div>
                <p className="text-[var(--muted)] text-xs mb-0.5">Status</p>
                <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full capitalize
                  ${sub.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : sub.status === "trial"  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                  {sub.status || "trial"}
                </span>
              </div>
              <div>
                <p className="text-[var(--muted)] text-xs mb-0.5">Expiry</p>
                <div className="flex items-center gap-1">
                  <Calendar size={11} className="text-[var(--muted)]" />
                  <p className="font-semibold text-[var(--text)]">{formatDate(sub.expiryDate)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Renewal options */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-[var(--text)]">Renewal Options</h2>

          <div className="grid grid-cols-2 gap-3">
            {(["monthly", "yearly"] ).map((cycle) => {
              const cyclePrice = cycle === "yearly" ? prices.yearly : prices.monthly;
              const selected   = billingCycle === cycle;
              return (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${selected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-[var(--border)] hover:border-blue-300"}`}
                >
                  <p className={`text-xs font-semibold capitalize mb-1 ${selected ? "text-blue-600" : "text-[var(--muted)]"}`}>
                    {cycle}
                  </p>
                  <p className={`text-lg font-black ${selected ? "text-blue-700 dark:text-blue-400" : "text-[var(--text)]"}`}>
                    ₹{cyclePrice.toLocaleString()}
                  </p>
                  {cycle === "yearly" && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Save ~20% vs monthly
                    </p>
                  )}
                  {selected && (
                    <CheckCircle size={14} className="text-blue-600 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Plan</span>
              <span className="font-semibold text-[var(--text)]">{planId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Billing</span>
              <span className="font-semibold text-[var(--text)] capitalize">{billingCycle}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-2">
              <span className="font-semibold text-[var(--text)]">Total</span>
              <span className="font-black text-blue-600">₹{amount.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleRenew}
            disabled={paying || loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            {paying ? (
              <><Loader2 size={16} className="animate-spin" /> Processing...</>
            ) : (
              <><CreditCard size={16} /> Renew for ₹{amount.toLocaleString()}</>
            )}
          </button>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
