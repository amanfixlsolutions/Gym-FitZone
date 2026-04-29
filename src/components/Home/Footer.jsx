"use client";

import React from 'react';
import { Dumbbell, MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FaFacebook, href: "https://facebook.com", label: "Facebook", color: "hover:bg-blue-600" },
    { icon: FaInstagram, href: "https://instagram.com", label: "Instagram", color: "hover:bg-pink-600" },
    { icon: FaTwitter, href: "https://twitter.com", label: "Twitter", color: "hover:bg-blue-400" },
    { icon: FaYoutube, href: "https://youtube.com", label: "YouTube", color: "hover:bg-red-600" }
  ];

  const quickLinks = [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Blog", href: "#" },
    { name: "FAQs", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" }
  ];

  return (
    <footer id="contact" className="bg-gray-900 pt-4 md:pt-6 pb-4 md:pb-6">
      <div className="container mx-auto px-3 md:px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Brand Column */}
          <div className="group">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <div className="relative">
                <Dumbbell className="text-amber-500 w-6 h-6 md:w-7 md:h-7 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="text-lg md:text-xl font-bold text-white">Fit<span className="text-amber-500">Zone</span></span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
              Your trusted partner in fitness since 2014. 10+ years of transforming lives.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-7 h-7 md:w-8 md:h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="font-bold text-white text-sm md:text-base mb-2 md:mb-3">Quick Links</h4>
            <ul className="space-y-1.5 md:space-y-2">
              {quickLinks.map((item, idx) => (
                <li key={idx}>
                  <a href={item.href} className="text-gray-400 hover:text-amber-500 transition-all duration-300 hover:translate-x-1 inline-block text-xs md:text-sm">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h4 className="font-bold text-white text-sm md:text-base mb-2 md:mb-3">Contact Info</h4>
            <ul className="space-y-2 md:space-y-2.5">
              <li className="flex gap-2 text-gray-400 group items-start">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs md:text-sm">123 Fitness Ave, NY 10001</span>
              </li>
              <li className="flex gap-2 text-gray-400 group items-center">
                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs md:text-sm">+1 234 567 8900</span>
              </li>
              <li className="flex gap-2 text-gray-400 group items-center">
                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs md:text-sm">hello@flexzone.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours Column */}
          <div>
            <h4 className="font-bold text-white text-sm md:text-base mb-2 md:mb-3">Opening Hours</h4>
            <ul className="space-y-1.5 md:space-y-2 text-gray-400">
              <li className="hover:text-amber-500 transition-colors duration-300 text-xs md:text-sm">
                <span className="font-medium">Monday - Friday:</span> 24/7
              </li>
              <li className="hover:text-amber-500 transition-colors duration-300 text-xs md:text-sm">
                <span className="font-medium">Saturday:</span> 6:00 AM - 10:00 PM
              </li>
              <li className="hover:text-amber-500 transition-colors duration-300 text-xs md:text-sm">
                <span className="font-medium">Sunday:</span> 8:00 AM - 8:00 PM
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-4 md:pt-6 text-center">
          <p className="text-gray-500 text-[10px] md:text-xs">
            &copy; {currentYear} FitZone. 10+ Years of Fitness Excellence. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; opacity: 0; animation-fill-mode: forwards; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; animation-fill-mode: forwards; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; animation-fill-mode: forwards; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; animation-fill-mode: forwards; }
      `}</style>
    </footer>
  );
};

export default Footer;