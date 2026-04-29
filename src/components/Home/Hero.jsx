"use client";

import React from 'react';
import { ArrowRight, Clock, Users } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="pt-16 sm:pt-20 md:pt-28 pb-12 sm:pb-16 relative overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center" style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
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
            {/* Badge / Tagline */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 md:mb-6 animate-scale-pop">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-white/90 text-xs md:text-sm font-semibold tracking-wide">EST. 2014 • PREMIUM FITNESS</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.2] sm:leading-[1.2] px-2 animate-fade-up">
              Transform Your Body,{' '}
              <span className="relative inline-block">
                <span className="relative bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent animate-scale-pop" style={{ animationDelay: '0.2s' }}>
                  Transform Your Life
                </span>
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-gray-200 mt-4 sm:mt-6 max-w-2xl mx-auto leading-relaxed px-3 animate-fade-up delay-200">
              Whether You're A Beginner Or An Experienced Athlete, We're Here To Help You Reach New Heights. From Weight Loss To Strength Building, Our Programs Are Tailored Just For You.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 md:mt-10 justify-center px-4">
              <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 flex items-center gap-2 justify-center group text-sm sm:text-base animate-scale-pop hover:scale-105 active:scale-95" style={{ animationDelay: '0.3s' }}>
                JOIN FREE <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button className="border-2 border-amber-400 text-amber-400 px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all duration-300 text-sm sm:text-base animate-scale-pop hover:scale-105 active:scale-95" style={{ animationDelay: '0.4s' }}>
                START NOW »
              </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-10 md:mt-14 max-w-3xl mx-auto px-2">
              <div className="hero-stat-card text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-1">
                  <span className="inline-block animate-bounce-in" style={{ animationDelay: '0.5s' }}>10</span>
                  <span className="inline-block">+</span>
                </div>
                <div className="text-gray-300 text-[11px] sm:text-xs md:text-sm font-medium mt-1">Years of Excellence</div>
              </div>
              <div className="hero-stat-card text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-1">
                  <span className="inline-block animate-bounce-in" style={{ animationDelay: '0.6s' }}>5</span>
                  <span className="inline-block">K</span>
                  <span className="inline-block">+</span>
                </div>
                <div className="text-gray-300 text-[11px] sm:text-xs md:text-sm font-medium mt-1">Active Members</div>
              </div>
              <div className="hero-stat-card text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer animate-fade-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-1">
                  <span className="inline-block animate-bounce-in" style={{ animationDelay: '0.7s' }}>30</span>
                  <span className="inline-block">+</span>
                </div>
                <div className="text-gray-300 text-[11px] sm:text-xs md:text-sm font-medium mt-1">Expert Trainers</div>
              </div>
              <div className="hero-stat-card text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer animate-fade-up" style={{ animationDelay: '0.5s' }}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-1">
                  <span className="inline-block animate-bounce-in" style={{ animationDelay: '0.8s' }}>24</span>
                  <span className="inline-block text-base sm:text-lg">/</span>
                  <span className="inline-block">7</span>
                </div>
                <div className="text-gray-300 text-[11px] sm:text-xs md:text-sm font-medium mt-1">Gym Access</div>
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
    </section>
  );
};

export default Hero;