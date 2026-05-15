"use client";
/**
 * Gym Owner layout — wraps all /gym-owner/* pages with RoleGuard.
 * Ensures only users with role "gym-owner" can access these pages.
 */
import RoleGuard from "@/components/RoleGuard";

export default function GymOwnerLayout({ children }) {
  return (
    <RoleGuard roles={["gym-owner"]}>
      {children}
    </RoleGuard>
  );
}
