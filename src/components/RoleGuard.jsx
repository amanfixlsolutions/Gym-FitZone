"use client";
/**
 * RoleGuard — client-side role-based access control component.
 *
 * Wraps protected pages. On mount it checks the authenticated user's role
 * against the required roles. If the user is not authorized it:
 *   1. Shows a toast notification ("Not authorized")
 *   2. Redirects to the appropriate dashboard
 *
 * Usage:
 *   <RoleGuard roles={["gym-owner"]}>
 *     <GymOwnerPage />
 *   </RoleGuard>
 */

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { showError } from "@/lib/toast";

// ── Role → home dashboard map ──────────────────────────────────────
const ROLE_HOME = {
  "super-admin": "/super-admin",
  "gym-owner":   "/gym-owner",
  "member":      "/",
};

/**
 * @param {object}   props
 * @param {string[]} props.roles     — allowed roles (e.g. ["gym-owner"])
 * @param {React.ReactNode} props.children
 * @param {string}   [props.fallback] — custom redirect path (optional)
 */
export default function RoleGuard({ roles, children, fallback }) {
  const { user, loaded } = useAuth();
  const router           = useRouter();
  const toastShown       = useRef(false);

  useEffect(() => {
    if (!loaded) return; // wait for auth to hydrate

    // Not logged in → redirect to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Wrong role → show toast + redirect
    if (roles && roles.length > 0 && !roles.includes(user.role)) {
      if (!toastShown.current) {
        toastShown.current = true;
        showError(
          `Not authorized. This area is for ${roles.join(" / ")} only.`
        );
      }
      const dest = fallback || ROLE_HOME[user.role] || "/";
      router.replace(dest);
    }
  }, [loaded, user, roles, fallback, router]);

  // While auth is loading — render nothing (avoids flash)
  if (!loaded) return null;

  // Not logged in or wrong role — render nothing (redirect in progress)
  if (!user || (roles && roles.length > 0 && !roles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
