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
    <div className="space-y-6">
      <PageHeaderStrip
        icon={Bell}
        title="Reminders"
        description="View your reminders across projects and create new project-scoped reminders."
        actions={
          projectId ? (
            <ReminderCreateDialog
              projectId={projectId}
              triggerLabel="Create reminder"
            />
          ) : null
        }
      />

      <div className="max-w-sm space-y-2">
        <Label>Project for new reminders</Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger>
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

      <RemindersList mine />
    </div>
  );
}
