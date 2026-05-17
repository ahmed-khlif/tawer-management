"use client";

import Loading from "@/components/page-loader";
import AccessDenied from "@/components/error/access-denied";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import ProjectTemplatesPage from "@/modules/projects/components/project-templates-page";

export default function ProjectTemplatesRender() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return <Loading />;
  if (user && !hasPermissions(user.roles, "projectsManagement", "view")) {
    return <AccessDenied />;
  }

  return <ProjectTemplatesPage />;
}
