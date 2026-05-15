"use client";

import type { ReactNode } from "react";

interface PermissionGuardProps {
  allowed: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({
  allowed,
  children,
  fallback = null,
}: PermissionGuardProps) {
  return allowed ? <>{children}</> : <>{fallback}</>;
}

export default PermissionGuard;
