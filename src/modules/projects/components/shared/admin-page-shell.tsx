"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminPageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminPageShell({ children, className }: AdminPageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-col gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default AdminPageShell;
