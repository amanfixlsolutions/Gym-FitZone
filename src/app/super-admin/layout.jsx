"use client";
/**
 * Super Admin layout — wraps all /super-admin/* pages with RoleGuard.
 * Ensures only users with role "super-admin" can access these pages.
 */
import RoleGuard from "@/components/RoleGuard";

export default function SuperAdminLayout({ children }) {
  return (
    <RoleGuard roles={["super-admin"]}>
      {children}
    </RoleGuard>
  );
}
