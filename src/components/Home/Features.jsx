"use client";

import React, { useState, useEffect } from 'react';
import { Dumbbell, Activity, Users, Award, ChevronLeft, ChevronRight } from 'lucide-react';

const Features = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-slide timer for mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % featureImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isMobile]);

  // Images for each card
  const featureImages = [
    {
      src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=500&fit=crop",
      alt: "Best Training - Personal Training Session",
      badge: "Expert Coaching"
    },
    {
      src: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=500&fit=crop",
      alt: "Modern Equipment - Gym Machines",
      badge: "Latest Technology"
    },
    {
      src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=500&fit=crop",
      alt: "Experience Trainers - Professional Trainers",
      badge: "Certified Professionals"
    },
    {
      src: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=500&fit=crop",
      alt: "Award Winners - Recognition",
      badge: "Award Winning"
    }
  ];

  const features = [
    {
      icon: <Dumbbell className="w-5 h-5" />,
      title: "Best Training",
      description: "Best Training door sit amet consectetur. Cras eros molestie habitasse sed proin volutpat sollicitudin adipiscing.",
      gradient: "from-amber-500 to-orange-500",
      imageIndex: 0
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: "Modern Equipment",
      description: "Modern Equipment door sit amet volutpat. Cras eros molestie habitasse sed proin volutpat sollicitudin adipiscing.",
      gradient: "from-blue-500 to-indigo-500",
      imageIndex: 1
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Experience Trainers",
      description: "Experience Trainers door sit amet volutpat. Cras eros molestie habitasse sed proin volutpat sollicitudin adipiscing.",
      gradient: "from-emerald-500 to-teal-500",
      imageIndex: 2
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Award Winners",
      description: "Award Winners door sit amet consectetur. Cras eros molestie habitasse sed proin volutpat sollicitudin adipiscing.",
      gradient: "from-purple-500 to-pink-500",
      imageIndex: 3
    }
  ];

  const handleCardHover = (index) => {
    if (!isMobile) {
      setHoveredCard(index);
      setActiveImage(features[index].imageIndex);
    }
  };

  const handleCardLeave = () => {
    if (!isMobile) {
      setHoveredCard(null);
    }
  };

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % featureImages.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + featureImages.length) % featureImages.length);
  };

  return (
    <section id="features" className="py-8 md:py-12 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Left Side - Content */}
          <div className="w-full lg:flex-1">
            <div className="mb-6 text-center lg:text-left">
              <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider animate-fade-up inline-block">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2 animate-fade-up delay-100">
                Why Choose <span className="text-amber-500">FitZone?</span>
              </h2>
              <p className="text-gray-600 text-base mt-3 animate-fade-up delay-200 max-w-lg mx-auto lg:mx-0">
                When picking a gym, consider its amenities like guest access, hours, location, and extra benefits to enhance your experience.
              </p>
            </div>

            {/* Features Grid - Desktop */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up delay-300 ${isMobile ? 'hidden' : 'grid'}`}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group bg-gray-50/50 p-4 rounded-xl transition-all duration-200 cursor-pointer border ${
                    hoveredCard === index 
                      ? 'shadow-lg -translate-y-1 border-amber-300 bg-amber-50/50' 
                      : 'hover:shadow-lg hover:-translate-y-1 border-gray-100'
                  }`}
                  onMouseEnter={() => handleCardHover(index)}
                  onMouseLeave={handleCardLeave}
                >
                  <div className={`bg-gradient-to-r ${feature.gradient} w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all duration-200 ${
                    hoveredCard === index ? 'rotate-6 scale-110' : ''
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-base font-bold mt-3 transition-colors duration-200 ${
                    hoveredCard === index ? 'text-amber-600' : 'text-gray-800 group-hover:text-amber-600'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className="text-black text-xs mt-2 leading-relaxed line-clamp-3">
                    {feature.description} 
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Image Section */}
          <div className={`${isMobile ? 'w-full' : 'lg:flex-1'} w-full mt-8 lg:mt-0 animate-fade-up delay-200`}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              {/* Main Image Container */}
              <div className="relative w-full h-[280px] sm:h-[350px] md:h-[400px] lg:h-[420px] overflow-hidden rounded-2xl">
                {featureImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="absolute inset-0 rounded-2xl transition-opacity duration-500 ease-in-out"
                    style={{
                      zIndex: activeImage === idx ? 10 : 0,
                      opacity: activeImage === idx ? 1 : 0,
                    }}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      loading="eager"
                      style={{ display: 'block' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  </div>
                ))}

                {/* Mobile Navigation Arrows */}
                {isMobile && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Badge - Responsive */}
              <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 md:px-4 md:py-2 shadow-md transition-all duration-200 hover:scale-105">
                <p className="text-gray-800 font-bold text-xs md:text-sm">{featureImages[activeImage]?.badge}</p>
                <p className="text-amber-500 text-[10px] md:text-xs">of Excellence</p>
              </div>

              {/* Image Indicators - Responsive */}
              <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex gap-1.5 md:gap-2 z-20">
                {featureImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImage(idx);
                    }}
                    className={`h-1.5 md:h-2 rounded-full transition-all duration-150 ${
                      activeImage === idx 
                        ? 'bg-amber-500 w-4 md:w-6' 
                        : 'bg-white/70 hover:bg-amber-400 w-1.5 md:w-2'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Mobile Title Display */}
            {isMobile && (
              <div className="text-center mt-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {features[activeImage]?.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {features[activeImage]?.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 1024px) {
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      `}</style>
    </section>
  );
};

export default Features;