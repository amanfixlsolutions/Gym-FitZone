"use client";

import React from 'react';
import { CheckCircle } from 'lucide-react';

const Membership = () => {
  const plans = [
    {
      name: "Basic",
      price: "$20",
      period: "/mo",
      features: [
        "Gym without Trainers",
        "Unlimited Access",
        "Access to all Clubs",
        "Training for all Classes",
        "Exclusive Studio",
        "Additional Session"
      ],
      popular: false,
      color: "from-slate-400 to-slate-500"
    },
    {
      name: "Standard",
      price: "$35",
      period: "/mo",
      features: [
        "Gym without Trainers",
        "Unlimited Access",
        "Access to all Clubs",
        "Training for all Classes",
        "Exclusive Studio",
        "Additional Session"
      ],
      popular: false,
      color: "from-blue-500 to-indigo-500"
    },
    {
      name: "Professional",
      price: "$50",
      period: "/mo",
      features: [
        "Gym without Trainers",
        "Unlimited Access",
        "Access to all Clubs",
        "Training for all Classes",
        "Exclusive Studio",
        "Additional Session"
      ],
      popular: true,
      color: "from-amber-500 to-orange-500"
    },
    {
      name: "Family",
      price: "$65",
      period: "/mo",
      features: [
        "Gym without Trainers",
        "Unlimited Access",
        "Access to all Clubs",
        "Training for all Classes",
        "Exclusive Studio",
        "Additional Session"
      ],
      popular: false,
      color: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <section id="membership" className="py-8 md:py-10 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f59e0b\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      <div className="container mx-auto px-3 md:px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-5 md:mb-7">
          <span className="text-amber-500 font-semibold text-xs md:text-sm uppercase tracking-wider animate-fade-up">Pricing Plans</span>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1 md:mt-2 animate-fade-up delay-100">
            Membership <span className="text-amber-500 gradient-text-animate">Plans</span>
          </h2>
          <div className="w-12 md:w-16 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mt-2 md:mt-3"></div>
          <p className="text-gray-500 text-xs md:text-sm mt-2 md:mt-3 animate-fade-up delay-200">
            Gym session walk can help. Physical activity stimulates many brain chemicals that may leave you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl md:rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer animate-fade-up ${plan.popular ? 'border-2 border-amber-500 relative hover:border-amber-600 shadow-lg' : 'border border-gray-100'
                }`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-bl-lg text-[10px] md:text-xs font-semibold animate-pulse-glow z-10">
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
                    <li key={i} className="flex items-center gap-1.5 md:gap-2 text-black text-[15px] md:text-xs group-hover:translate-x-1 transition-transform duration-300">
                      <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-1.5 md:py-2 rounded-full font-semibold transition-all duration-300 text-[11px] md:text-sm ${plan.popular
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30'
                      : 'border border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white'
                    } hover:scale-105 active:scale-95 btn-ripple`}
                >
                  Join Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Membership;