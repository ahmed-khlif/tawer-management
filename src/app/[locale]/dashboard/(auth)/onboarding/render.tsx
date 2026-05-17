"use client";

import Loading from "@/components/page-loader";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import ProjectOnboardingPage from "@/modules/projects/components/project-onboarding-page";

export default function OnboardingRender() {
  const { isLoading } = useCurrentUser();

  if (isLoading) return <Loading />;
  return <ProjectOnboardingPage />;
}
