"use client";

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import Classes from './Classes';
import Trainers from './Trainers';
import Membership from './Membership';
import Testimonials from './Testimonials';
import CTA from './CTA';
import Footer from './Footer';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  // FIX: start as null so server and client both render the same initial state
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userName, setUserName] = useState("");
  // FIX: track whether we've mounted (client-only)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    // Read localStorage only on client after mount
    const savedLogin = localStorage.getItem('isLoggedIn');
    const savedName = localStorage.getItem('userName');
    if (savedLogin === 'true' && savedName) {
      setIsLoggedIn(true);
      setUserName(savedName);
    } else {
      setIsLoggedIn(false);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Login Handler
  const handleLogin = (email, password, setError) => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (email === "user@fitzone.com" && password === "password") {
      setIsLoggedIn(true);
      setUserName("John");
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', 'John');
      setShowLoginModal(false);
    } else if (email === "demo@fitzone.com" && password === "demo123") {
      setIsLoggedIn(true);
      setUserName("Demo");
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', 'Demo');
      setShowLoginModal(false);
    } else {
      setError("Invalid email or password. Try: user@fitzone.com / password");
    }
  };

  // Signup Handler
  const handleSignup = (name, email, password, setError) => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoggedIn(true);
    setUserName(name);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name);
    setShowSignupModal(false);
  };

  // Logout Handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
  };

  // Don't render auth-dependent UI until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="bg-white min-h-screen overflow-x-hidden">
        <div className="fitzone-animations" />
        <Navbar scrolled={false} isLoggedIn={false} userName="" onLoginClick={() => {}} onSignupClick={() => {}} onLogout={() => {}} />
        <Hero />
        <Features />
        <Classes />
        <Trainers />
        <Membership />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Custom Animations CSS — using a regular style tag, not jsx global */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes scaleInPop {
          0% { opacity: 0; transform: scale(0.5); }
          60% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { box-shadow: 0 0 0 15px rgba(245, 158, 11, 0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes modalFade {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes heroOverlayPulse {
          0% { background-color: rgba(0, 0, 0, 0.55); }
          50% { background-color: rgba(0, 0, 0, 0.45); }
          100% { background-color: rgba(0, 0, 0, 0.55); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        .animate-fade-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-down { animation: fadeInDown 0.8s ease-out forwards; }
        .animate-fade-left { animation: fadeInLeft 0.8s ease-out forwards; }
        .animate-fade-right { animation: fadeInRight 0.8s ease-out forwards; }
        .animate-scale { animation: scaleIn 0.6s ease-out forwards; }
        .animate-scale-pop { animation: scaleInPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-slow { animation: floatSlow 5s ease-in-out infinite; }
        .animate-modal { animation: modalFade 0.3s ease-out forwards; }
        .animate-hero-overlay { animation: heroOverlayPulse 8s ease-in-out infinite; }
        .animate-bounce-in { animation: bounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        
        .delay-100 { animation-delay: 0.1s; opacity: 0; animation-fill-mode: forwards; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; animation-fill-mode: forwards; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; animation-fill-mode: forwards; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; animation-fill-mode: forwards; }
        .delay-500 { animation-delay: 0.5s; opacity: 0; animation-fill-mode: forwards; }
        .delay-600 { animation-delay: 0.6s; opacity: 0; animation-fill-mode: forwards; }
        
        .hover-lift { transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1); }
        .hover-lift:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.2); }
        
        .btn-ripple { position: relative; overflow: hidden; }
        .btn-ripple::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          transition: width 0.4s, height 0.4s;
        }
        .btn-ripple:active::after { width: 300px; height: 300px; opacity: 0; }
        
        .gradient-text-animate {
          background: linear-gradient(120deg, #f59e0b, #ea580c, #f59e0b);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 3s linear infinite;
        }
        
        .hero-stat-card {
          transition: all 0.3s ease;
        }
        .hero-stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Navbar is handled by /user/layout.jsx — no duplicate here */}
      <Hero />
      <Features />
      <Classes />
      <Trainers />
      <Membership />
      <Testimonials />
      <CTA />
      {/* Footer is handled by /user/layout.jsx */}

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
        onLogin={handleLogin}
      />

      <SignupModal 
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
        onSignup={handleSignup}
      />
    </div>
  );
};

export default Home;