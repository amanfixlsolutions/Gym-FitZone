"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle, Star, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { planAPI } from "@/lib/api";
import Link from "next/link";

const planIcons = ["��", "⭐", "👑", "🏠", "💎", "🚀"];
const planColors = [
  "from-slate-400 to-slate-500",
  "from-blue-500 to-indigo-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-violet-500",
  "from-rose-500 to-pink-500",
];

const faqs = [
  { q: "Can I cancel my membership anytime?", a: "Yes, you can cancel your membership at any time. There are no long-term contracts or cancellation fees." },
  { q: "Is there a free trial available?", a: "We offer a 7-day free trial for new members. No credit card required to start your trial." },
  { q: "Can I upgrade or downgrade my plan?", a: "Absolutely! You can change your plan at any time. Changes take effect at the start of your next billing cycle." },
  { q: "Are there any hidden fees?", a: "No hidden fees. The price you see is the price you pay. All taxes are included in the listed price." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, UPI, net banking and digital wallets." },
];

const testimonials = [
  { name: "Rahul S.", plan: "Professional", text: "Best investment I made for my health. The trainers are world-class!", rating: 5, avatar: "RS" },
  { name: "Priya M.", plan: "Standard", text: "Affordable and excellent facilities. Highly recommend the Standard plan!", rating: 5, avatar: "PM" },
  { name: "Amit K.", plan: "Family", text: "The Family plan is perfect for us. My whole family loves it!", rating: 5, avatar: "AK" },
];

export default function MembershipPage() {
  const [plans,        setPlans]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [openFaq,      setOpenFaq]      = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  // ── Fetch real plans from backend ─────────────────────────────
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await planAPI.getPublic({ limit: 20 });
        setPlans(res.data || []);
      } catch {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // ── Normalize plan from backend ────────────────────────────────
  const normPlan = (plan, idx) => ({
    id:       plan._id,
    name:     plan.name,
    price:    plan.price,
    duration: plan.duration,
    unit:     plan.unit,
    icon:     planIcons[idx % planIcons.length],
    color:    planColors[idx % planColors.length],
    features: plan.features?.length ? plan.features : [
      "Full Gym Access",
      "Locker Room",
      "Group Classes",
      "App Access",
    ],
    popular:  plan.popular || false,
    active:   plan.active !== false,
    subscribers: plan.totalSubscribers || 0,
  });

  const normalizedPlans = plans.map(normPlan);

  // ── Format price with billing cycle ───────────────────────────
  const displayPrice = (plan) => {
    if (billingCycle === "yearly") {
      const monthly = Math.round(plan.price * 0.8);
      return `₹${monthly.toLocaleString()}`;
    }
    return `₹${plan.price.toLocaleString()}`;
  };

  const displayPeriod = (plan) => {
    if (billingCycle === "yearly") return "/mo (billed yearly)";
    return `/${plan.duration} ${plan.unit?.toLowerCase()}`;
  };

  return (
    <div className="bg-white">

      {/* ── SECTION 1: Hero + Plans ── */}
      <section className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-amber-50 to-orange-50 pt-16">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-amber-700 font-semibold text-sm uppercase tracking-wide">Pricing Plans</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3">
              Membership <span className="text-amber-500">Plans</span>
            </h1>
            <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-4" />
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto mb-5">
              Choose the plan that fits your goals. No hidden fees, cancel anytime.
            </p>
            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-md border border-amber-100">
              <button onClick={() => setBillingCycle("monthly")} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${billingCycle === "monthly" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm" : "text-gray-500 hover:text-amber-600"}`}>Monthly</button>
              <button onClick={() => setBillingCycle("yearly")} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${billingCycle === "yearly" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm" : "text-gray-500 hover:text-amber-600"}`}>Yearly <span className="text-[10px] text-emerald-500 font-bold ml-1">Save 20%</span></button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><RefreshCw className="w-8 h-8 text-amber-500 animate-spin" /></div>
          ) : normalizedPlans.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No plans available yet. Please check back soon.</p>
          ) : (
            <div className={`grid gap-4 max-w-6xl mx-auto ${normalizedPlans.length <= 2 ? "md:grid-cols-2" : normalizedPlans.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"}`}>
              {normalizedPlans.map((plan, i) => (
                <div key={plan.id} className={`bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer relative ${plan.popular ? "border-2 border-amber-500 shadow-lg" : "border border-gray-100"}`}>
                  {plan.popular && <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-bl-lg text-xs font-semibold">Most Popular</div>}
                  <div className="p-5">
                    <div className="text-3xl mb-3">{plan.icon}</div>
                    <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                    <div className="mt-2 mb-4">
                      <span className="text-3xl font-bold text-gray-800">{displayPrice(plan)}</span>
                      <span className="text-gray-500 text-sm">{displayPeriod(plan)}</span>
                    </div>
                    {plan.subscribers > 0 && (
                      <p className="text-[10px] text-emerald-600 font-semibold mb-2">✓ {plan.subscribers.toLocaleString()} active subscribers</p>
                    )}
                    <ul className="space-y-2 mb-5">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-gray-600 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/login">
                      <button className={`w-full py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 ${plan.popular ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30" : "border border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white"}`}>
                        Join Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {["No Hidden Fees", "Cancel Anytime", "Secure Payment", "24/7 Support", "Free Trial"].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm text-gray-600 bg-white rounded-full px-4 py-2 shadow-sm"><CheckCircle className="w-4 h-4 text-amber-500" /> {t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Testimonials ── */}
      <section className="min-h-screen flex flex-col justify-center bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">What <span className="text-amber-500">Members Say</span></h2>
            <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-amber-50 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-0.5 mb-3">{[1,2,3,4,5].map(s => <Star key={s} size={13} className="text-amber-400 fill-amber-400" />)}</div>
                <p className="text-sm text-gray-600 italic mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                  <div><p className="text-sm font-bold text-gray-800">{t.name}</p><p className="text-xs text-amber-500">{t.plan} Plan</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: FAQ + CTA ── */}
      <section className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-amber-50 to-orange-50 py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Frequently Asked <span className="text-amber-500">Questions</span></h2>
            <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-2" />
          </div>
          <div className="max-w-2xl mx-auto space-y-3 mb-10">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-amber-100 rounded-xl overflow-hidden bg-white shadow-sm">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-amber-50 transition-colors">
                  <span className="text-sm font-semibold text-gray-800">{faq.q}</span>
                  <span className={`text-amber-500 text-lg font-bold transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-amber-50">{faq.a}</div>}
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to Start Your Fitness Journey?</h2>
            <p className="text-amber-100 text-sm mb-6 max-w-lg mx-auto">Join thousands of members who have already transformed their lives with FitZone.</p>
            <Link href="/login">
              <button className="bg-white text-amber-600 px-8 py-3 rounded-full font-bold text-sm hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto">
                Get Started Today <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
