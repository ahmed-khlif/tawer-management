"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { retrieveProjects } from "@/modules/projects/services";
import ReminderCreateDialog from "@/modules/reminders/components/reminder-create-dialog";
import RemindersList from "@/modules/reminders/components/reminders-list";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban, PlusCircle, Sparkles } from "lucide-react";

export default function RemindersPageRender() {
  const [projectId, setProjectId] = useState<string>("");
  const projectsQuery = useQuery({
    queryKey: ["reminder-project-options"],
    queryFn: () => retrieveProjects({ page: 1, limit: 100 }),
  });

  const projects = useMemo(
    () => projectsQuery.data?.data ?? [],
    [projectsQuery.data?.data],
  );

  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={Bell}
        title="Reminders"
        description="View your reminders across projects and create new project-scoped reminders."
        metrics={[
          {
            icon: FolderKanban,
            value: projects.length,
            label: "projects loaded",
            tone: "info",
          },
          projectId
            ? {
                icon: PlusCircle,
                label: "Create in selected project",
                tone: "primary",
              }
            : false,
        ]}
        actions={
          projectId ? (
            <ReminderCreateDialog
              projectId={projectId}
              triggerLabel="Create reminder"
            />
          ) : null
        }
      />

      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Project for new reminders</Label>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Pick the project context first, then create a reminder that lands in the right workspace.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="w-full sm:min-w-[280px]">
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {projectId ? (
              <ReminderCreateDialog
                projectId={projectId}
                triggerLabel="Create reminder"
              />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <RemindersList mine />
    </AdminPageShell>
  );
}
