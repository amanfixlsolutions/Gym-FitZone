"use client";
import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const contactInfo = [
  { icon: MapPin, title: "Visit Us", info: "123 Fitness Avenue, Andheri West\nMumbai – 400058, India", color: "bg-amber-100 text-amber-600" },
  { icon: Phone, title: "Call Us", info: "+91 98765 43210\n+91 98765 43211", color: "bg-orange-100 text-orange-600" },
  { icon: Mail, title: "Email Us", info: "hello@fitzone.in\nsupport@fitzone.in", color: "bg-red-100 text-red-600" },
  { icon: Clock, title: "Working Hours", info: "Mon–Fri: 5:30 AM – 11:00 PM\nSat–Sun: 6:00 AM – 10:00 PM", color: "bg-yellow-100 text-yellow-600" },
];

const socialLinks = [
  { icon: FaFacebook, href: "https://facebook.com", label: "Facebook", color: "hover:bg-blue-600" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram", color: "hover:bg-pink-600" },
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter", color: "hover:bg-blue-400" },
  { icon: FaYoutube, href: "https://youtube.com", label: "YouTube", color: "hover:bg-red-600" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div className="bg-white">

      {/* ── SECTION 1: Hero + Contact Info ── */}
      <section className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-amber-50 to-orange-50 pt-16">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3">
              Get In <span className="text-amber-500">Touch</span>
            </h1>
            <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-4" />
            <p className="text-gray-800 text-sm md:text-base max-w-xl mx-auto">
              Have questions? We are here to help you on your fitness journey. Reach out anytime!
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {contactInfo.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-amber-50 text-center">
                <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">{c.title}</h3>
                <p className="text-xs text-black whitespace-pre-line leading-relaxed">{c.info}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
            {[
              { val: "24/7", label: "Support Available" },
              { val: "<1hr", label: "Response Time" },
              { val: "5K+", label: "Happy Members" },
              { val: "4.9★", label: "Satisfaction" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-md border border-amber-100">
                <p className="text-2xl md:text-3xl font-bold text-amber-500">{s.val}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Form + Map ── */}
      <section className="min-h-screen flex flex-col justify-center bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Send Us a <span className="text-amber-500">Message</span>
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-2" />
            <p className="text-xs text-gray-400 mt-2">We'll get back to you within 24 hours</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">

            {/* Form */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 shadow-md">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Message Sent!</h3>
                  <p className="text-sm text-gray-500">Thank you for reaching out. We'll respond shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                      <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Rahul Sharma"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                      <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="rahul@example.com"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Subject *</label>
                      <select required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-gray-600 bg-white">
                        <option value="">Select topic</option>
                        <option>Membership Query</option>
                        <option>Class Booking</option>
                        <option>Personal Training</option>
                        <option>Technical Support</option>
                        <option>Feedback</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Message *</label>
                    <textarea required rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Tell us how we can help you..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none bg-white" />
                  </div>
                  <button type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Map + Social */}
            <div className="space-y-4">
              {/* Map placeholder */}
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl overflow-hidden shadow-md h-64 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-800">Iron Paradise Fitness</p>
                    <p className="text-xs text-gray-600">Andheri West, Mumbai</p>
                    <button className="mt-3 px-4 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-full hover:bg-amber-600 transition-colors">
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 shadow-md">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                      className={`w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm ${s.color}`}
                      aria-label={s.label}>
                      <s.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 shadow-md">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Links</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[["View Classes", "/user/classes"], ["Meet Trainers", "/user/trainers"], ["Membership Plans", "/user/membership"], ["Book a Trial", "/user/membership"]].map(([label, href], i) => (
                    <Link key={i} href={href}
                      className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-amber-500 transition-colors group">
                      <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
