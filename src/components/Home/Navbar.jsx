"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home',       href: '/' },
  { label: 'Classes',    href: '/classes' },
  { label: 'Trainers',   href: '/trainers' },
  { label: 'Membership', href: '/membership' },
  { label: 'Blog',       href: '/blog' },
  { label: 'Contact',    href: '/contact' },
];

const Navbar = ({ scrolled, isLoggedIn, userName, onLoginClick, onSignupClick, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Only use pathname after mount to avoid hydration mismatch
  useEffect(() => { setMounted(true); }, []);

  const isActive = (href) => mounted && pathname === href;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white shadow-xl py-2' : 'bg-white/95 backdrop-blur-md py-4'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            <Dumbbell className="text-amber-500 w-8 h-8 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="text-2xl font-bold text-gray-800 group-hover:scale-105 transition-transform duration-300">
            Fit<span className="text-amber-500 relative">
              Zone
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300" />
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative font-medium transition-colors group ${isActive ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            );
          })}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium text-sm">Welcome, {userName}!</span>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-600 transition-all duration-300 hover:scale-105"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="border-2 border-amber-500 text-amber-600 px-5 py-2 rounded-full text-sm font-semibold hover:bg-amber-500 hover:text-white transition-all duration-300 hover:scale-105"
              >
                Login
              </button>
              <button
                onClick={onSignupClick}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-xl py-4 px-4 flex flex-col gap-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-2 font-medium transition-colors ${isActive ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          {isLoggedIn ? (
            <>
              <span className="text-gray-700 font-medium text-sm">Welcome, {userName}!</span>
              <button onClick={onLogout} className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold w-full">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="border-2 border-amber-500 text-amber-600 px-6 py-2 rounded-full text-sm font-semibold w-full">Login</button>
              <button onClick={() => { onSignupClick(); setIsMenuOpen(false); }} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold w-full">Sign Up</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
