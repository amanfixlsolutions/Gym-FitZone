"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Clock, ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const Classes = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const autoSlideInterval = useRef(null);

  const classes = [
    {
      name: "HIIT Training",
      time: "45 min",
      intensity: "High",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=450&fit=crop",
      color: "from-red-500 to-orange-500",
      icon: "⚡",
      calories: "450-600 cal",
      level: "Advanced",
      spots: "8 spots left",
      trainer: "Sarah Johnson",
      rating: 4.9,
      description: "High Intensity Training",
      reps: "6 reps"
    },
    {
      name: "Power Yoga",
      time: "60 min",
      intensity: "Medium",
      image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=450&fit=crop",
      color: "from-amber-400 to-orange-400",
      icon: "🧘",
      calories: "250-350 cal",
      level: "All Levels",
      spots: "12 spots left",
      trainer: "Emma Davis",
      rating: 4.8,
      description: "Power Yoga",
      reps: "2 reps"
    },
    {
      name: "Strength Training",
      time: "50 min",
      intensity: "High",
      image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=450&fit=crop",
      color: "from-orange-500 to-amber-600",
      icon: "💪",
      calories: "400-550 cal",
      level: "Intermediate",
      spots: "5 spots left",
      trainer: "Mike Chen",
      rating: 4.9,
      description: "Strength Training",
      reps: "5 reps",
      weight: "4kg"
    },
    {
      name: "Cardio Blast",
      time: "35 min",
      intensity: "Very High",
      image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&h=450&fit=crop",
      color: "from-pink-500 to-rose-500",
      icon: "🏃",
      calories: "500-700 cal",
      level: "Advanced",
      spots: "3 spots left",
      trainer: "Jessica Lee",
      rating: 4.7,
      description: "Workout",
      reps: "3 reps"
    },
    {
      name: "Zumba Dance",
      time: "55 min",
      intensity: "Medium",
      image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&h=450&fit=crop",
      color: "from-purple-500 to-indigo-500",
      icon: "💃",
      calories: "350-500 cal",
      level: "Beginner",
      spots: "15 spots left",
      trainer: "Maria Garcia",
      rating: 4.8,
      description: "Dance Fitness",
      reps: "4 reps"
    },
    {
      name: "CrossFit",
      time: "70 min",
      intensity: "Extreme",
      image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=450&fit=crop",
      color: "from-red-600 to-orange-600",
      icon: "🏋️",
      calories: "600-800 cal",
      level: "Expert",
      spots: "2 spots left",
      trainer: "Alex Turner",
      rating: 5.0,
      description: "Intense Workout",
      reps: "8 reps"
    }
  ];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentIndex, classes.length]);

  const getSlidesToShow = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  const totalSlides = classes.length;
  const slidesToShow = getSlidesToShow();
  const maxIndex = totalSlides - slidesToShow;

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex > maxIndex ? 0 : newIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - 1;
      return newIndex < 0 ? maxIndex : newIndex;
    });
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const startAutoSlide = () => {
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
    }
    autoSlideInterval.current = setInterval(() => {
      nextSlide();
    }, 2500); // 2.5 seconds
  };

  const stopAutoSlide = () => {
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
      autoSlideInterval.current = null;
    }
  };

  const handleManualNavigation = (callback) => {
    stopAutoSlide();
    callback();
    startAutoSlide();
  };

  return (
    <section id="classes" className="py-8 md:py-12 bg-gradient-to-br from-amber-50 to-white">
      <div className="container mx-auto px-3 md:px-4">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-full mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-700 font-semibold text-xs uppercase">Our Programs</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Popular <span className="text-amber-500">Classes</span>
          </h2>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-3"></div>
          <p className="text-gray-600 text-sm mt-3">Find the perfect class for your fitness journey</p>
        </div>

        {/* Slider Box - Like Amazon */}
        <div className="relative group">
          {/* Cards Slider Container */}
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
              }}
            >
              {classes.map((classItem, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 px-1.5 md:px-2"
                  style={{ width: `${100 / slidesToShow}%` }}
                >
                  <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-md transition-all duration-300 h-full class-card">
                    {/* Image */}
                    <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                      <img
                        src={classItem.image}
                        alt={classItem.name}
                        className="w-full h-full object-cover transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${classItem.color} opacity-40`}></div>
                      
                      {/* Level Badge */}
                      <div className={`absolute top-2 right-2 md:top-3 md:right-3 bg-gradient-to-r ${classItem.color} px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[9px] md:text-xs font-bold text-white shadow-md z-10`}>
                        {classItem.icon} {classItem.level}
                      </div>

                      {/* Spots Badge */}
                      <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[9px] md:text-[11px] font-bold text-white z-10">
                        {classItem.spots}
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[9px] md:text-[11px] font-bold text-white flex items-center gap-1 z-10">
                        <Clock className="w-2 h-2 md:w-3 md:h-3" />
                        {classItem.time}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2.5 md:p-4">
                      {/* Rating */}
                      <div className="flex items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
                        <Star className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-[10px] md:text-sm font-semibold text-gray-800">{classItem.rating}</span>
                        <span className="text-[8px] md:text-xs text-black">(895 reviews)</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm md:text-lg font-bold text-black mb-0.5 md:mb-1">{classItem.name}</h3>
                      <p className="text-[9px] md:text-xs text-black mb-2 md:mb-3">{classItem.trainer}</p>

                      {/* Description */}
                      <p className="text-[10px] md:text-sm text-black mb-2 md:mb-3 line-clamp-2">
                        {classItem.description} • {classItem.calories} • {classItem.reps}
                      </p>

                      {/* Book Button */}
                      <button className="w-full py-1.5 md:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] md:text-sm font-semibold rounded-lg md:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 md:gap-2">
                        <span>Register Now</span>
                        <ArrowRight className="w-2.5 h-2.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows - Inside the slider box, on hover like Amazon */}
          {!isMobile && (
            <>
              <button
                onClick={() => handleManualNavigation(prevSlide)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 shadow-lg rounded-full p-2 hover:text-white transition-all duration-300 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              
              <button
                onClick={() => handleManualNavigation(nextSlide)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 shadow-lg rounded-full p-2 hover:text-white transition-all duration-300 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Navigation Arrows & Dots */}
        <div className="mt-6 md:mt-8 md:hidden">
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => handleManualNavigation(prevSlide)}
              className="bg-white shadow-md rounded-full p-2 hover:bg-amber-500 hover:text-white transition-all duration-300 w-8 h-8 flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Dot Indicators */}
            <div className="flex gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleManualNavigation(() => goToSlide(index))}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === index ? 'w-5 bg-amber-500' : 'w-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => handleManualNavigation(nextSlide)}
              className="bg-white shadow-md rounded-full p-2 hover:bg-amber-500 hover:text-white transition-all duration-300 w-8 h-8 flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop Dots */}
        <div className="hidden md:flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleManualNavigation(() => goToSlide(index))}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'w-6 bg-amber-500' : 'w-2 bg-gray-300 hover:bg-amber-300'
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Fix hover effect - only the hovered card scales */
        .class-card {
          transition: all 0.3s ease;
        }
        
        .class-card:hover {
          transform: scale(1.02);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        
        /* Remove the global scale effect from parent container */
        .flex-shrink-0:hover {
          z-index: 10;
        }
      `}</style>
    </section>
  );
};

export default Classes;