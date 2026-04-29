"use client";

import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = React.useRef(null);

  const testimonials = [
    { 
      name: "John Doe", 
      role: "Lost 30 lbs", 
      text: "FlexZone changed my life! The trainers are amazing and the community is incredibly supportive.", 
      stars: 5, 
      image: "JD", 
      beforeAfter: true,
      improvement: "+45%"
    },
    { 
      name: "Jane Smith", 
      role: "Gained Strength", 
      text: "Best decision I ever made. The equipment is top-notch and classes are so much fun.", 
      stars: 5, 
      image: "JS", 
      beforeAfter: false,
      improvement: null
    },
    { 
      name: "Mike Ross", 
      role: "Marathon Ready", 
      text: "Professional trainers who actually care about your progress. Highly recommended!", 
      stars: 5, 
      image: "MR", 
      beforeAfter: true,
      improvement: "+45%"
    },
    { 
      name: "Sarah Williams", 
      role: "Weight Loss", 
      text: "I lost 40 pounds in 6 months! The personalized training plans made all the difference.", 
      stars: 5, 
      image: "SW", 
      beforeAfter: true,
      improvement: "+60%"
    },
    { 
      name: "David Brown", 
      role: "Muscle Gain", 
      text: "Gained 20lbs of muscle in a year. The strength training program is exceptional.", 
      stars: 5, 
      image: "DB", 
      beforeAfter: false,
      improvement: null
    },
    { 
      name: "Emily Clark", 
      role: "Fitness Journey", 
      text: "Amazing community and professional trainers. Best decision I ever made for my health!", 
      stars: 5, 
      image: "EC", 
      beforeAfter: true,
      improvement: "+50%"
    }
  ];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && isMobile) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 4000); // Change slide every 4 seconds
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, currentIndex, isMobile]);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= testimonials.length ? 0 : newIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - 1;
      return newIndex < 0 ? testimonials.length - 1 : newIndex;
    });
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    // Reset auto-play timer on manual click
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      if (isAutoPlaying && isMobile) {
        autoPlayRef.current = setInterval(() => {
          nextSlide();
        }, 4000);
      }
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    if (isMobile && isAutoPlaying) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }
  };

  const handleMouseLeave = () => {
    if (isMobile && isAutoPlaying) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
          nextSlide();
        }, 2700);
      }
    }
  };

  // For desktop: show grid layout
  // For mobile: show slider with 1 card at a time
  const getSlidesToShow = () => {
    if (isMobile) return 1;
    return 3;
  };

  const slidesToShow = getSlidesToShow();
  const totalSlides = testimonials.length;
  const maxIndex = totalSlides - slidesToShow;

  return (
    <section id="testimonials" className="py-4 md:py-6 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-amber-100 rounded-full opacity-30 blur-2xl md:blur-3xl"></div>
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center max-w-2xl mx-auto mb-4 md:mb-6">
          <span className="text-amber-500 font-semibold text-xs md:text-sm uppercase tracking-wider animate-fade-up">Testimonials</span>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1 md:mt-2 animate-fade-up delay-100">
            Success <span className="text-amber-500 gradient-text-animate">Stories</span>
          </h2>
          <div className="w-12 md:w-16 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mt-2 md:mt-3"></div>
          <p className="text-gray-500 text-xs md:text-sm mt-2 md:mt-3 animate-fade-up delay-200">Hear what our members have to say about their transformation journey.</p>
        </div>

        {/* Desktop Grid View */}
        {!isMobile && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-amber-50 to-white p-4 md:p-5 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer hover-lift border border-amber-100 animate-fade-up"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="flex gap-0.5 md:gap-1 mb-2 md:mb-3">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-black text-xs md:text-sm italic leading-relaxed">"{testimonial.text}"</p>
                <div className="mt-3 md:mt-4 flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs md:text-sm">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm md:text-base">{testimonial.name}</p>
                    <p className="text-amber-500 text-[10px] md:text-xs">{testimonial.role}</p>
                  </div>
                </div>
                {testimonial.beforeAfter && (
                  <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-amber-200">
                    <p className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-500" />
                      <span className="text-green-600 font-semibold">{testimonial.improvement}</span> improvement in 3 months
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mobile Slider View */}
        {isMobile && (
          <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Cards Slider Container */}
            <div className="overflow-hidden rounded-xl">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ 
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-full px-1"
                  >
                    <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-xl border border-amber-100">
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(testimonial.stars)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <p className="text-gray-600 text-xs italic leading-relaxed">"{testimonial.text}"</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                          {testimonial.image}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{testimonial.name}</p>
                          <p className="text-amber-500 text-[10px]">{testimonial.role}</p>
                        </div>
                      </div>
                      {testimonial.beforeAfter && (
                        <div className="mt-2 pt-2 border-t border-amber-200">
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <TrendingUp className="w-2.5 h-2.5 text-green-500" />
                            <span className="text-green-600 font-semibold">{testimonial.improvement}</span> improvement in 3 months
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Arrows & Controls */}
            <div className="flex justify-center items-center gap-3 mt-4">
              <button
                onClick={prevSlide}
                className="bg-white shadow-md rounded-full p-1.5 hover:bg-amber-500 hover:text-white transition-all duration-300 w-7 h-7 flex items-center justify-center"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              
              {/* Dot Indicators */}
              <div className="flex gap-1.5">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      currentIndex === index ? 'w-4 bg-amber-500' : 'w-1 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                className="bg-white shadow-md rounded-full p-1.5 hover:bg-amber-500 hover:text-white transition-all duration-300 w-7 h-7 flex items-center justify-center"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Play/Pause Button */}
              <button
                onClick={toggleAutoPlay}
                className="bg-white shadow-md rounded-full p-1.5 hover:bg-amber-500 hover:text-white transition-all duration-300 w-7 h-7 flex items-center justify-center"
              >
                {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>

            {/* Auto-play Indicator */}
            <div className="text-center mt-2">
              <p className="text-[9px] text-gray-400">
                {isAutoPlaying ? '✨ Auto-sliding every 4 seconds' : '⏸️ Auto-slide paused'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;