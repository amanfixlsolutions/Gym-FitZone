"use client";

import React, { useState } from 'react';
import { Dumbbell, XCircle, Eye, EyeOff } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onLogin }) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginEmail, loginPassword, setLoginError);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fade-up">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-modal">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XCircle className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-scale-pop">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 animate-fade-up delay-100">Welcome Back!</h2>
          <p className="text-gray-500 text-sm mt-1 animate-fade-up delay-200">Login to your FlexZone account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="animate-fade-up delay-300">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              placeholder="user@fitzone.com"
            />
          </div>

          <div className="animate-fade-up delay-400">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all pr-10"
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {loginError && (
            <p className="text-red-500 text-sm text-center animate-fade-up">{loginError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] btn-ripple animate-scale-pop delay-500"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center animate-fade-up delay-600">
          <p className="text-sm text-gray-500">
            Demo credentials: user@fitzone.com / password
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-amber-600 font-semibold hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;