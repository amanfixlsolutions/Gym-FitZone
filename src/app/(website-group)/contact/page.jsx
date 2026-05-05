"use client";
import React, { useState, useEffect } from "react";
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle,
  ArrowRight, Loader2, AlertCircle, Globe,
} from "lucide-react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { settingsAPI } from "@/lib/api";

const SOCIAL_LINKS = [
  { icon: FaFacebook,  href: "https://facebook.com",  label: "Facebook",  hoverBg: "hover:bg-blue-600" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram", hoverBg: "hover:bg-pink-600" },
  { icon: FaTwitter,   href: "https://twitter.com",   label: "Twitter",   hoverBg: "hover:bg-blue-400" },
  { icon: FaYoutube,   href: "https://youtube.com",   label: "YouTube",   hoverBg: "hover:bg-red-600" },
];

const EMPTY_FORM = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactPage() {
  const [info,      setInfo]      = useState(null);
  const [infoLoad,  setInfoLoad]  = useState(true);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [sending,   setSending]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");

  // ── Fetch gym contact info from backend ────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await settingsAPI.getPublic();
        if (!cancelled && res.data) setInfo(res.data);
      } catch {
        // silently fall back to defaults
      } finally {
        if (!cancelled) setInfoLoad(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Derived contact cards ──────────────────────────────────────
  const contactCards = info ? [
    {
      icon: MapPin, title: "Visit Us",
      info: [info.address, `${info.city}${info.city ? ", India" : ""}`].filter(Boolean).join("\n") || "123 Fitness Avenue\nMumbai, India",
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: Phone, title: "Call Us",
      info: info.phone || "+91 98765 43210",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: Mail, title: "Email Us",
      info: info.email || "hello@fitzone.in",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Clock, title: "Working Hours",
      info: info.timings
        ? Object.entries(info.timings).map(([day, time]) => `${day}: ${time}`).join("\n")
        : "Mon–Fri: 5:30 AM – 11:00 PM\nSat–Sun: 6:00 AM – 10:00 PM",
      color: "bg-yellow-100 text-yellow-600",
    },
  ] : [
    { icon: MapPin, title: "Visit Us",      info: "123 Fitness Avenue\nMumbai – 400058, India", color: "bg-amber-100 text-amber-600" },
    { icon: Phone,  title: "Call Us",       info: "+91 98765 43210",                             color: "bg-orange-100 text-orange-600" },
    { icon: Mail,   title: "Email Us",      info: "hello@fitzone.in",                            color: "bg-red-100 text-red-600" },
    { icon: Clock,  title: "Working Hours", info: "Mon–Fri: 5:30 AM – 11:00 PM\nSat–Sun: 6:00 AM – 10:00 PM", color: "bg-yellow-100 text-yellow-600" },
  ];

  // ── Submit contact form ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await settingsAPI.submitContact(form);
      setSubmitted(true);
      setForm(EMPTY_FORM);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const gymName = info?.gymName || "FitZone";
  const gymCity = info?.city    || "Mumbai";

  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="min-h-[60vh] flex flex-col justify-center bg-gradient-to-br from-amber-50 to-orange-50 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
              <Mail className="w-4 h-4 text-amber-500" />
              <span className="text-amber-700 font-semibold text-sm uppercase tracking-wide">Contact Us</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3">
              Get In <span className="text-amber-500">Touch</span>
            </h1>
            <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-4" />
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
              Have questions? We are here to help you on your fitness journey. Reach out anytime!
            </p>
            {info?.gymName && (
              <p className="text-amber-600 font-semibold text-sm mt-2">📍 {info.gymName}</p>
            )}
          </div>

          {/* Contact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {infoLoad
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-white rounded-2xl animate-pulse shadow-md" />
                ))
              : contactCards.map((c, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-amber-50 text-center">
                    <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <c.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 mb-2">{c.title}</h3>
                    <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{c.info}</p>
                  </div>
                ))
            }
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
            {[
              { val: "24/7",  label: "Support Available" },
              { val: "<1hr",  label: "Response Time" },
              { val: "5K+",   label: "Happy Members" },
              { val: "4.9★",  label: "Satisfaction" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-md border border-amber-100">
                <p className="text-2xl md:text-3xl font-bold text-amber-500">{s.val}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM + MAP ── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
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
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Message Sent!</h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Thank you for reaching out. We'll respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input
                        required type="text" value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Rahul Sharma"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                      <input
                        required type="email" value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="rahul@example.com"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel" value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                      <select
                        required value={form.subject}
                        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-gray-600 bg-white"
                      >
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
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                    <textarea
                      required rows={4} value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us how we can help you..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {sending
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                      : <><Send className="w-4 h-4" /> Send Message</>
                    }
                  </button>
                </form>
              )}
            </div>

            {/* Right side — map placeholder + social + quick links */}
            <div className="space-y-4">

              {/* Map placeholder with real gym info */}
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl overflow-hidden shadow-md h-56 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4">
                    <MapPin className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-800">{gymName}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {infoLoad ? "Loading..." : (info?.address || "123 Fitness Avenue")}, {gymCity}
                    </p>
                    {info?.email && (
                      <p className="text-xs text-amber-600 mt-1">✉ {info.email}</p>
                    )}
                    {info?.phone && (
                      <p className="text-xs text-amber-600">📞 {info.phone}</p>
                    )}
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent((info?.address || "Fitness Gym") + " " + gymCity)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block px-4 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-full hover:bg-amber-600 transition-colors"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>

              {/* Website link if available */}
              {info?.website && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 shadow-md flex items-center gap-3">
                  <Globe className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <a href={info.website} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-amber-600 font-semibold hover:underline truncate">
                    {info.website}
                  </a>
                </div>
              )}

              {/* Social links */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 shadow-md">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  {SOCIAL_LINKS.map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                      className={`w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm ${s.hoverBg}`}
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
                  {[
                    ["View Classes",     "/classes"],
                    ["Meet Trainers",    "/trainers"],
                    ["Membership Plans", "/membership"],
                    ["Book a Trial",     "/membership"],
                  ].map(([label, href], i) => (
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
