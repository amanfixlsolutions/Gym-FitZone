"use client";
import { useState, useEffect, useCallback } from "react";
import { QrCode, RefreshCw, Download, Loader2, AlertCircle } from "lucide-react";
import { memberAPI } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────
// MemberQRCode
// Props: { memberId, memberName, planName, expiryDate }
// ─────────────────────────────────────────────────────────────────
export default function MemberQRCode({ memberId, memberName, planName, expiryDate }) {
  const [qrCode,   setQrCode]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const fetchQR = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await memberAPI.getQR(memberId);
      setQrCode(res.data?.qrCode || null);
    } catch (err) {
      setError(err.message || "Failed to load QR code.");
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchQR();
  }, [fetchQR]);

  // Download QR as PNG
  const handleDownload = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `fitzone-qr-${memberName?.replace(/\s+/g, "-").toLowerCase() || "member"}.png`;
    link.click();
  };

  const fmtExpiry = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code display */}
      <div className="relative w-52 h-52 flex items-center justify-center bg-white rounded-2xl border-2 border-amber-200 shadow-md overflow-hidden">
        {loading ? (
          /* Loading skeleton */
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs text-gray-400">Generating QR…</p>
          </div>
        ) : error ? (
          /* Error state */
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-xs text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchQR}
              className="text-xs text-amber-600 font-semibold hover:underline mt-1"
            >
              Try again
            </button>
          </div>
        ) : qrCode ? (
          /* QR image */
          <img
            src={qrCode}
            alt={`QR code for ${memberName || "member"}`}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          /* No QR yet */
          <div className="flex flex-col items-center gap-2">
            <QrCode className="w-10 h-10 text-gray-300" />
            <p className="text-xs text-gray-400">No QR code</p>
          </div>
        )}
      </div>

      {/* Member info below QR */}
      <div className="text-center">
        {memberName && (
          <p className="text-sm font-bold text-gray-800">{memberName}</p>
        )}
        {planName && (
          <p className="text-xs text-amber-600 font-semibold mt-0.5">{planName} Plan</p>
        )}
        {expiryDate && (
          <p className="text-xs text-gray-500 mt-0.5">
            Expires: {fmtExpiry(expiryDate)}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={fetchQR}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
        <button
          onClick={handleDownload}
          disabled={!qrCode || loading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          <Download size={13} />
          Download
        </button>
      </div>
    </div>
  );
}
