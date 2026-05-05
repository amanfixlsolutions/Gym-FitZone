"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { planAPI } from '@/lib/api';

// Static color map — no dynamic Tailwind
const PLAN_COLORS = [
  "from-slate-400 to-slate-500",
  "from-blue-500 to-indigo-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-pink-500",
  "from-rose-500 to-red-500",
];

const Membership = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch plans from backend ───────────────────────────────────
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await planAPI.getPublic({ limit: 6 });
        const raw = res.data || res.plans || [];
        setPlans(raw);
      } catch {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // ── Normalize backend plan data ────────────────────────────────
  const normalizePlan = (plan, index) => {
    // Build features list from plan data
    const features = [];
    if (plan.features && Array.isArray(plan.features) && plan.features.length > 0) {
      features.push(...plan.features);
    } else {
      if (plan.gymAccess !== false)       features.push("Gym Access");
      if (plan.classAccess !== false)     features.push("Class Access");
      if (plan.trainerAccess)             features.push("Personal Trainer");
      if (plan.nutritionPlan)             features.push("Nutrition Plan");
      if (plan.lockerAccess !== false)    features.push("Locker Access");
      if (plan.guestPasses)               features.push(`${plan.guestPasses} Guest Passes`);
      if (features.length === 0) {
        features.push("Gym Access", "Unlimited Classes", "Locker Access", "Expert Trainers");
      }
    }

    // Format price
    const price = plan.price != null
      ? `₹${Number(plan.price).toLocaleString('en-IN')}`
      : "Contact Us";

    // Duration label
    const durationLabel = plan.duration === 1 ? "/mo"
      : plan.duration === 3  ? "/3 mo"
      : plan.duration === 6  ? "/6 mo"
      : plan.duration === 12 ? "/yr"
      : plan.duration ? `/${plan.duration} mo`
      : "/mo";

    return {
      _id:      plan._id,
      name:     plan.name || "Plan",
      price,
      period:   durationLabel,
      features: features.slice(0, 6),
      popular:  plan.isPopular || plan.popular || index === 2,
      color:    PLAN_COLORS[index % PLAN_COLORS.length],
    };
  };

  return (
    <section id="membership" className="py-8 md:py-10 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="container mx-auto px-3 md:px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-5 md:mb-7">
          <span className="text-amber-500 font-semibold text-xs md:text-sm uppercase tracking-wider">Pricing Plans</span>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1 md:mt-2">
            Membership <span className="text-amber-500">Plans</span>
          </h2>
          <div className="w-12 md:w-16 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mt-2 md:mt-3"></div>
          <p className="text-gray-500 text-xs md:text-sm mt-2 md:mt-3">
            Choose the plan that fits your fitness goals and budget.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        )}

        {/* No plans */}
        {!loading && plans.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No membership plans available right now. Check back soon!
          </div>
        )}

        {/* Plans Grid */}
        {!loading && plans.length > 0 && (
          <div className={`grid gap-3 md:gap-4 max-w-7xl mx-auto ${
            plans.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
            plans.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
            plans.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {plans.map((rawPlan, index) => {
              const plan = normalizePlan(rawPlan, index);
              return (
                <div
                  key={plan._id || index}
                  className={`bg-white rounded-xl md:rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${
                    plan.popular
                      ? 'border-2 border-amber-500 relative hover:border-amber-600 shadow-lg'
                      : 'border border-gray-100'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-bl-lg text-[10px] md:text-xs font-semibold z-10">
                      Most Popular
                    </div>
                  )}
                  <div className="p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-bold text-gray-800">{plan.name}</h3>
                    <div className="mt-2 md:mt-3 mb-3 md:mb-4">
                      <span className="text-2xl md:text-3xl font-bold text-gray-800">{plan.price}</span>
                      <span className="text-black text-xs md:text-sm">{plan.period}</span>
                    </div>
                    <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-1.5 md:gap-2 text-black text-[15px] md:text-xs transition-transform duration-300">
                          <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-500 flex-shrink-0" />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="/membership"
                      className={`block w-full py-1.5 md:py-2 rounded-full font-semibold transition-all duration-300 text-[11px] md:text-sm text-center hover:scale-105 active:scale-95 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30'
                          : 'border border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white'
                      }`}
                    >
                      Join Now
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Membership;
