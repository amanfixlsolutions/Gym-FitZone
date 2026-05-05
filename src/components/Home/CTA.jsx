"use client";

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const CTA = () => {
  return (
    <section className="py-6 md:py-8 bg-gradient-to-r from-amber-500 to-orange-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      <div className="container mx-auto px-3 md:px-4 text-center relative z-10">
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3">Ready to Start Your Journey?</h2>
          <p className="text-white/90 text-sm md:text-base mb-4 md:mb-5 max-w-2xl mx-auto px-2">
            Join FitZone today and get access to world-class trainers, classes, and facilities.
          </p>
          <div className="flex gap-3 md:gap-4 justify-center flex-wrap">
            <Link
              href="/membership"
              className="bg-white text-amber-600 px-4 md:px-6 py-1.5 md:py-2 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-gray-50 active:scale-95 flex items-center gap-1.5 md:gap-2 group text-xs md:text-sm"
            >
              View Membership Plans <Sparkles className="w-3 h-3 md:w-4 md:h-4 group-hover:rotate-12 transition-transform duration-300" />
            </Link>
            <Link
              href="/signup"
              className="border-2 border-white text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 group flex items-center gap-1.5 md:gap-2 text-xs md:text-sm"
            >
              Get Started Free <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
