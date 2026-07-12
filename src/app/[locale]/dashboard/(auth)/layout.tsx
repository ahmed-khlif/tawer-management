"use client";
import React from "react";
import useUser from "@/modules/auth/hooks/users/use-user";
import { useRouter } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import useUserStore from "@/modules/auth/store/user-store";
import { initializeAuthSession } from "@/modules/auth/services/refresh-token";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import Loading from "@/components/page-loader";
import { CheckInScreen } from "@/modules/tracking/components/attendance/check-in";
import AttendanceWrapper from "@/modules/tracking/components/attendance/wrapper";

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useUser();
  const sessionReady = useUserStore((store) => store.sessionReady);
  const router = useRouter();
  const pathname = usePathname();
  const isOnboardingRoute = pathname?.includes("/dashboard/onboarding");

  useEffect(() => {
    if (!sessionReady) {
      initializeAuthSession();
    }
  }, [sessionReady]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (!sessionReady || isLoading) {
    return <Loading />;
  }

  if (isOnboardingRoute) {
    return (
      <AttendanceWrapper>
        <div className="min-h-screen bg-background">
          {children}
        </div>
        <CheckInScreen />
      </AttendanceWrapper>
    );
  }

  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)"
        } as React.CSSProperties
      }>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <AttendanceWrapper>
          <div className="flex flex-1 flex-col">
            <div className="@container/main p-4 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
              {children}
            </div>
          </div>
        </AttendanceWrapper>
        <CheckInScreen />

      </SidebarInset>
    </SidebarProvider>
  );
}
