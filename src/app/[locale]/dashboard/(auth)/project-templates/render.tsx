"use client";

import Loading from "@/components/page-loader";
import AccessDenied from "@/components/error/access-denied";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import ProjectTemplatesPage from "@/modules/projects/components/project-templates-page";
import { canViewProjectTemplates } from "@/modules/projects/utils/template-access";

export default function ProjectTemplatesRender() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return <Loading />;
  if (user && !canViewProjectTemplates(user.roles)) {
    return <AccessDenied />;
  }

  return <ProjectTemplatesPage />;
}
