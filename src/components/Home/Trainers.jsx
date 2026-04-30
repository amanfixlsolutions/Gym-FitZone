"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Clock, 
  Users, 
  Calendar 
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Trainers = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const autoSlideInterval = useRef(null);

  const trainers = [
    { 
      name: "Sarah Johnson", 
      role: "HIIT Specialist", 
      image: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&h=400&fit=crop", 
      experience: "8+ years", 
      achievements: "Certified HIIT Pro", 
      rating: 4.9,
      specialties: ["HIIT Training", "Cardio", "Weight Loss"],
      education: "BS in Exercise Science",
      certification: "NASM Certified Trainer",
      clients: "500+",
      facebook: "https://facebook.com/sarah.johnson",
      instagram: "https://instagram.com/sarah_johnson",
      twitter: "https://twitter.com/sarah_johnson",
      bio: "Sarah is a passionate fitness expert who has helped over 500 clients achieve their fitness goals through high-intensity interval training."
    },
    { 
      name: "Mike Chen", 
      role: "Strength Coach", 
      image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=400&fit=crop", 
      experience: "10+ years", 
      achievements: "Bodybuilding Expert", 
      rating: 4.8,
      specialties: ["Strength Training", "Powerlifting", "Bodybuilding"],
      education: "BS in Kinesiology",
      certification: "CSCS Certified",
      clients: "800+",
      facebook: "https://facebook.com/mike.chen",
      instagram: "https://instagram.com/mike_chen",
      twitter: "https://twitter.com/mike_chen",
      bio: "Mike is a former competitive bodybuilder who now dedicates his time to helping others build strength and confidence."
    },
    { 
      name: "Emma Davis", 
      role: "Yoga Instructor", 
      image: "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=400&h=400&fit=crop", 
      experience: "6+ years", 
      achievements: "Certified Yoga Master", 
      rating: 4.9,
      specialties: ["Hatha Yoga", "Vinyasa", "Meditation"],
      education: "500hr RYT Certified",
      certification: "Yoga Alliance",
      clients: "300+",
      facebook: "https://facebook.com/emma.davis",
      instagram: "https://instagram.com/emma_davis",
      twitter: "https://twitter.com/emma_davis",
      bio: "Emma brings peace and mindfulness to her classes, helping students find balance between mind and body."
    },
    { 
      name: "David Wilson", 
      role: "Nutrition Expert", 
      image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&h=400&fit=crop", 
      experience: "12+ years", 
      achievements: "Sports Nutritionist", 
      rating: 4.7,
      specialties: ["Sports Nutrition", "Weight Management", "Meal Planning"],
      education: "MS in Nutrition Science",
      certification: "CISSN Certified",
      clients: "1000+",
      facebook: "https://facebook.com/david.wilson",
      instagram: "https://instagram.com/david_wilson",
      twitter: "https://twitter.com/david_wilson",
      bio: "David combines his knowledge of nutrition with practical advice to help clients achieve sustainable results."
    },
    { 
      name: "Jessica Lee", 
      role: "Zumba Instructor", 
      image: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&h=400&fit=crop", 
      experience: "5+ years", 
      achievements: "Zumba Certified", 
      rating: 4.9,
      specialties: ["Zumba", "Dance Fitness", "Aerobics"],
      education: "Zumba Basic Certification",
      certification: "Zumba Instructor",
      clients: "400+",
      facebook: "https://facebook.com/jessica.lee",
      instagram: "https://instagram.com/jessica_lee",
      twitter: "https://twitter.com/jessica_lee",
      bio: "Jessica's energetic classes make fitness fun and exciting through dance and music."
    },
    { 
      name: "Alex Turner", 
      role: "CrossFit Coach", 
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop", 
      experience: "7+ years", 
      achievements: "CrossFit Level 3", 
      rating: 4.9,
      specialties: ["CrossFit", "Olympic Lifting", "Endurance"],
      education: "CrossFit Level 3 Trainer",
      certification: "CF-L3 Trainer",
      clients: "600+",
      facebook: "https://facebook.com/alex.turner",
      instagram: "https://instagram.com/alex_turner",
      twitter: "https://twitter.com/alex_turner",
      bio: "Alex pushes clients to their limits while ensuring proper form and safety in every workout."
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

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentIndex, trainers.length]);

  const getSlidesToShow = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 4;
  };

  const totalSlides = trainers.length;
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
    }, 2500);
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

  const openTrainerDetails = (trainer) => {
    setSelectedTrainer(trainer);
  };

  const closeTrainerDetails = () => {
    setSelectedTrainer(null);
  };

  const openSocialLink = (url, e) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <section id="trainers" className="py-6 md:py-10 bg-white overflow-hidden">
        <div className="container mx-auto px-3 md:px-4">
          <div className="text-center max-w-2xl mx-auto mb-5 md:mb-7">
            <span className="text-amber-500 font-semibold text-xs md:text-sm uppercase tracking-wider inline-block">Meet Our Team</span>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1 md:mt-2">
              Meet Our <span className="text-amber-500">Expert Trainers</span>
            </h2>
            <div className="w-12 md:w-16 h-0.5 bg-amber-500 mx-auto mt-2 md:mt-3"></div>
            <p className="text-black text-xs md:text-sm mt-1 md:mt-3">Learn from the best certified fitness professionals in the industry.</p>
          </div>

          {/* Slider Box */}
          <div className="relative group">
            {/* Cards Slider Container */}
            <div className="overflow-hidden rounded-xl">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
                }}
              >
                {trainers.map((trainer, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 px-1.5 md:px-2"
                    style={{ width: `${100 / slidesToShow}%` }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div 
                      className={`bg-gradient-to-br from-amber-50 to-white rounded-xl md:rounded-2xl overflow-hidden shadow-md transition-all duration-300 cursor-pointer h-full ${
                        hoveredIndex === index ? 'scale-105 shadow-xl' : ''
                      }`}
                      onClick={() => openTrainerDetails(trainer)}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        <div className="relative w-full pt-[100%]">
                          <img
                            src={trainer.image}
                            alt={trainer.name}
                            className={`absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 ${
                              hoveredIndex === index ? 'scale-110' : ''
                            }`}
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${
                            hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                          }`}></div>
                        </div>
                        
                        {/* Rating Badge */}
                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded-lg shadow-md">
                          <div className="flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span className="text-[10px] font-bold text-gray-800">{trainer.rating}</span>
                          </div>
                        </div>

                        {/* Experience Badge */}
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-lg">
                          <div className="flex items-center gap-1">
                            <Clock className="w-2 h-2 text-amber-400" />
                            <span className="text-[8px] font-bold text-white">{trainer.experience}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-2.5 md:p-3">
                        <h3 className={`text-xs md:text-sm font-bold transition-colors truncate ${
                          hoveredIndex === index ? 'text-amber-600' : 'text-black'
                        }`}>
                          {trainer.name}
                        </h3>
                        <p className="text-[9px] md:text-[10px] text-black font-medium mt-0.5">{trainer.role}</p>
                        
                        {/* Achievement Badge */}
                        <div className="mt-1.5 md:mt-2">
                          <span className="inline-flex items-center gap-1 text-[7px] md:text-[8px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            <Award className="w-1.5 h-1.5 md:w-2 md:h-2" />
                            {trainer.achievements}
                          </span>
                        </div>

                        {/* Social Icons */}
                        <div className="flex gap-1.5 md:gap-2 justify-center mt-2 md:mt-3">
                          <button 
                            onClick={(e) => openSocialLink(trainer.facebook, e)}
                            className="w-5 h-5 md:w-7 md:h-7 bg-amber-100 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white hover:scale-110 text-amber-600"
                            aria-label="Facebook"
                          >
                            <FaFacebook className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => openSocialLink(trainer.instagram, e)}
                            className="w-5 h-5 md:w-7 md:h-7 bg-amber-100 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white hover:scale-110 text-amber-600"
                            aria-label="Instagram"
                          >
                            <FaInstagram className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => openSocialLink(trainer.twitter, e)}
                            className="w-5 h-5 md:w-7 md:h-7 bg-amber-100 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white hover:scale-110 text-amber-600"
                            aria-label="Twitter"
                          >
                            <FaTwitter className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows - Desktop */}
            {!isMobile && (
              <>
                <button
                  onClick={() => handleManualNavigation(prevSlide)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 shadow-lg rounded-full p-1.5 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleManualNavigation(nextSlide)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 shadow-lg rounded-full p-1.5 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="mt-4 md:mt-6 md:hidden">
            <div className="flex justify-center items-center gap-3">
              <button
                onClick={() => handleManualNavigation(prevSlide)}
                className="bg-white shadow-md rounded-full p-1.5 hover:bg-amber-500 hover:text-white transition-all duration-300 w-7 h-7 flex items-center justify-center"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              
              <div className="flex gap-1.5">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleManualNavigation(() => goToSlide(index))}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      currentIndex === index ? 'w-4 bg-amber-500' : 'w-1 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={() => handleManualNavigation(nextSlide)}
                className="bg-white shadow-md rounded-full p-1.5 hover:bg-amber-500 hover:text-white transition-all duration-300 w-7 h-7 flex items-center justify-center"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Dots */}
          <div className="hidden md:flex justify-center gap-2 mt-4 md:mt-5">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleManualNavigation(() => goToSlide(index))}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'w-5 bg-amber-500' : 'w-1.5 bg-gray-300 hover:bg-amber-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trainer Details Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeTrainerDetails}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={closeTrainerDetails}
                className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2 hover:bg-amber-500 hover:text-white transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Left Side - Image */}
                <div className="md:w-2/5 bg-gradient-to-br from-amber-500 to-orange-500 p-6 md:p-8 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <img
                      src={selectedTrainer.image}
                      alt={selectedTrainer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-white mt-3 md:mt-4 text-center">{selectedTrainer.name}</h3>
                  <p className="text-amber-100 text-xs md:text-sm mt-1">{selectedTrainer.role}</p>
                  
                  <div className="flex gap-3 mt-3 md:mt-4">
                    <button 
                      onClick={(e) => openSocialLink(selectedTrainer.facebook, e)}
                      className="w-8 h-8 md:w-9 md:h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-amber-500 transition-all duration-300 text-white"
                      aria-label="Facebook"
                    >
                      <FaFacebook className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                    <button 
                      onClick={(e) => openSocialLink(selectedTrainer.instagram, e)}
                      className="w-8 h-8 md:w-9 md:h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-amber-500 transition-all duration-300 text-white"
                      aria-label="Instagram"
                    >
                      <FaInstagram className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                    <button 
                      onClick={(e) => openSocialLink(selectedTrainer.twitter, e)}
                      className="w-8 h-8 md:w-9 md:h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-amber-500 transition-all duration-300 text-white"
                      aria-label="Twitter"
                    >
                      <FaTwitter className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Side - Details */}
                <div className="md:w-3/5 p-5 md:p-8">
                  <div className="mb-4 md:mb-6">
                    <h4 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">About Me</h4>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{selectedTrainer.bio}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-500">Experience</p>
                        <p className="text-xs md:text-sm font-semibold text-gray-800">{selectedTrainer.experience}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-500">Happy Clients</p>
                        <p className="text-xs md:text-sm font-semibold text-gray-800">{selectedTrainer.clients}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-500">Certification</p>
                        <p className="text-xs md:text-sm font-semibold text-gray-800">{selectedTrainer.certification?.split(' ')[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 fill-amber-500" />
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-500">Rating</p>
                        <p className="text-xs md:text-sm font-semibold text-gray-800">{selectedTrainer.rating} / 5.0</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 md:mb-6">
                    <h4 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {selectedTrainer.specialties.map((specialty, idx) => (
                        <span key={idx} className="px-2 py-0.5 md:px-3 md:py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] md:text-xs font-medium">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4 md:mb-6">
                    <h4 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">Education & Certifications</h4>
                    <ul className="space-y-1.5 md:space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5"></div>
                        <span className="text-xs md:text-sm text-gray-600">{selectedTrainer.education}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5"></div>
                        <span className="text-xs md:text-sm text-gray-600">{selectedTrainer.certification}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5"></div>
                        <span className="text-xs md:text-sm text-gray-600">{selectedTrainer.achievements}</span>
                      </li>
                    </ul>
                  </div>

                  <button className="mt-4 md:mt-6 w-full py-2 md:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs md:text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
                    Book a Session with {selectedTrainer.name.split(' ')[0]}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Trainers;