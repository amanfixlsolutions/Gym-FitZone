"use client";
import Link from "next/link";
import { AlertTriangle, X, ExternalLink } from "lucide-react";

/**
 * GracePeriodModal
 * Props: { isOpen, onClose, expiryDate, gracePeriodEndsAt }
 * Shown when subscription is expired (HTTP 402 from backend).
 */
export default function GracePeriodModal({ isOpen, onClose, expiryDate, gracePeriodEndsAt }) {
  if (!isOpen) return null;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null;

  const now = new Date();
  const graceEnd = gracePeriodEndsAt ? new Date(gracePeriodEndsAt) : null;
  const inGracePeriod = graceEnd && graceEnd > now;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="grace-modal-title"
    >
      {/* Modal panel — stop propagation so clicking inside doesn't close */}
      <div
        className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface2)] transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Warning icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-600" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-1">
          <h2 id="grace-modal-title" className="text-lg font-bold text-[var(--text)]">
            Subscription Expired
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Your gym's subscription has expired. Renew now to restore full access.
          </p>
        </div>

        {/* Details */}
        <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-4 space-y-2 text-sm">
          {expiryDate && (
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Expired on</span>
              <span className="font-semibold text-red-600">{formatDate(expiryDate)}</span>
            </div>
          )}
          {inGracePeriod && graceEnd && (
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Grace period ends</span>
              <span className="font-semibold text-amber-600">{formatDate(gracePeriodEndsAt)}</span>
            </div>
          )}
          {inGracePeriod && (
            <p className="text-xs text-amber-600 pt-1">
              ⚠️ You are in the grace period. Write operations are restricted until you renew.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Link
            href="/gym-owner/subscription/renew"
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            Renew Subscription
          </Link>
          <a
            href="mailto:support@fitzone.in"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)] text-sm rounded-xl transition-colors"
          >
            <ExternalLink size={13} />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
