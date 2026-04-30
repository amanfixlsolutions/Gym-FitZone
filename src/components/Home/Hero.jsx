"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const [stats, setStats] = useState({
    years: "0",
    members: "0",
    trainers: "0",
    access: "24/7"
  });

  useEffect(() => {
    // Animate Years (0 to 10)
    let yearsCount = 0;
    const yearsInterval = setInterval(() => {
      yearsCount++;
      if (yearsCount <= 10) {
        setStats(prev => ({ ...prev, years: yearsCount.toString() }));
      } else {
        clearInterval(yearsInterval);
      }
    }, 50);

    // Animate Members (0 to 5)
    let membersCount = 0;
    const membersInterval = setInterval(() => {
      membersCount++;
      if (membersCount <= 5) {
        setStats(prev => ({ ...prev, members: membersCount.toString() }));
      } else {
        clearInterval(membersInterval);
      }
    }, 80);

    // Animate Trainers (0 to 30)
    let trainersCount = 0;
    const trainersInterval = setInterval(() => {
      trainersCount += 2;
      if (trainersCount <= 30) {
        setStats(prev => ({ ...prev, trainers: trainersCount.toString() }));
      } else {
        setStats(prev => ({ ...prev, trainers: "30" }));
        clearInterval(trainersInterval);
      }
    }, 40);

    // Cleanup intervals
    return () => {
      clearInterval(yearsInterval);
      clearInterval(membersInterval);
      clearInterval(trainersInterval);
    };
  }, []);

  return (
    <section 
      id="home" 
      className="relative flex items-center justify-center w-full overflow-hidden"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh"
      }}
    >
      {/* Animated Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0 animate-hero-overlay"></div>
      
      {/* Floating Elements - Decorative */}
      <div className="absolute top-20 left-10 md:left-20 w-16 h-16 md:w-24 md:h-24 bg-amber-500/10 rounded-full blur-xl animate-float z-0"></div>
      <div className="absolute bottom-20 right-10 md:right-20 w-20 h-20 md:w-32 md:h-32 bg-orange-500/10 rounded-full blur-xl animate-float-slow z-0"></div>
      <div className="absolute top-1/2 right-5 md:right-10 w-8 h-8 md:w-12 md:h-12 bg-amber-400/20 rounded-full animate-pulse z-0"></div>
      
      {/* Animated Lines */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse z-0"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight md:leading-tight px-2 animate-fade-up">
              Transform Your Body,{' '}
              <span className="relative inline-block">
                <span className="relative bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent animate-scale-pop" style={{ animationDelay: '0.2s' }}>
                  Transform Your Life
                </span>
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm md:text-base text-gray-200 mt-4 md:mt-5 max-w-2xl mx-auto leading-relaxed px-3 animate-fade-up delay-200">
              Whether You're A Beginner Or An Experienced Athlete, We're Here To Help You Reach New Heights. From Weight Loss To Strength Building, Our Programs Are Tailored Just For You.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 md:mt-7 justify-center px-4">
              <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 flex items-center gap-2 justify-center group text-sm md:text-base animate-scale-pop hover:scale-105 active:scale-95" style={{ animationDelay: '0.3s' }}>
                JOIN FREE <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button className="border-2 border-amber-400 text-amber-400 px-5 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all duration-300 text-sm md:text-base animate-scale-pop hover:scale-105 active:scale-95" style={{ animationDelay: '0.4s' }}>
                START NOW »
              </button>
            </div>

            {/* Stats Section - Dynamic Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4 mt-6 md:mt-10 max-w-3xl mx-auto px-2">
              <div className="hero-stat-card text-center bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-3.5 hover:bg-white/20 transition-all duration-300 cursor-pointer animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-xl md:text-3xl font-bold text-white flex items-center justify-center gap-1">
                  <span className="inline-block animate-bounce-in" style={{ animationDelay: '0.5s' }}>{stats.years}</span>
                  <span className="inline-block">+</span>
                </div>
                <div className="text-gray-300 text-[10px] md:text-xs font-medium mt-0.5 md:mt-1">Years of Excellence</div>
              </div>
              <div className="hero-stat-card text-center bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-3.5 hover:bg-white/20 transition-all duration-300 cursor-pointer animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <div className="text-xl md:text-3xl font-bold text-white flex items-center justify-center gap-1">
                  <span className="inline-block animate-bounce-in" style={{ animationDelay: '0.6s' }}>{stats.members}</span>
                  <span className="inline-block">K</span>
                  <span className="inline-block">+</span>
                </div>
                <div className="text-gray-300 text-[10px] md:text-xs font-medium mt-0.5 md:mt-1">Active Members</div>
              </div>
              <div className="hero-stat-card text-center bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-3.5 hover:bg-white/20 transition-all duration-300 cursor-pointer animate-fade-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-xl md:text-3xl font-bold text-white flex items-center justify-center gap-1">
                  <span className="inline-block animate-bounce-in" style={{ animationDelay: '0.7s' }}>{stats.trainers}</span>
                  <span className="inline-block">+</span>
                </div>
                <div className="text-gray-300 text-[10px] md:text-xs font-medium mt-0.5 md:mt-1">Expert Trainers</div>
              </div>
              <div className="hero-stat-card text-center bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-3.5 hover:bg-white/20 transition-all duration-300 cursor-pointer animate-fade-up" style={{ animationDelay: '0.5s' }}>
                <div className="text-xl md:text-3xl font-bold text-white flex items-center justify-center gap-1">
                  <span className="inline-block animate-bounce-in" style={{ animationDelay: '0.8s' }}>{stats.access}</span>
                </div>
                <div className="text-gray-300 text-[10px] md:text-xs font-medium mt-0.5 md:mt-1">Gym Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 animate-bounce hidden md:block">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-amber-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* Mobile Responsive Fixes */}
      <style jsx>{`
        @media (max-width: 768px) {
          section {
            min-height: 100vh;
            padding: 20px 0;
          }
          h1 {
            font-size: 28px;
            line-height: 1.3;
          }
        }
        @media (max-width: 480px) {
          h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;