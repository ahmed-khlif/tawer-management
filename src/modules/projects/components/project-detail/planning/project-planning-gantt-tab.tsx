"use client";

import { useRouter } from "next/navigation";
import { GanttChart } from "lucide-react";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import ProjectGanttChart from "../../shared/gantt/project-gantt-chart";
import type { ProjectType } from "@/modules/projects/types/projects";
import type { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import type { GanttRow } from "@/modules/projects/types/gantt";
import useMilestoneGantt from "@/modules/projects/hooks/milestones/use-milestone-gantt";

interface ProjectPlanningGanttTabProps {
  project: ProjectType;
  permissions: ProjectPermissions;
}

export default function ProjectPlanningGanttTab({
  project,
  permissions: _permissions,
}: ProjectPlanningGanttTabProps) {
  const router = useRouter();
  const ganttQuery = useMilestoneGantt(project.id);

  const handleRowActivate = (row: GanttRow) => {
    if (row.type === "task") {
      router.push(`/dashboard/projects/${project.id}?tab=tasks&sub=kanban&taskId=${row.originalId}`);
      return;
    }

    if (row.type === "milestone") {
      router.push(`/dashboard/projects/${project.id}?tab=planning&sub=milestones&milestoneId=${row.originalId}`);
      return;
    }

    if (row.type === "sprint") {
      router.push(`/dashboard/projects/${project.id}?tab=planning&sub=sprints&sprintId=${row.originalId}`);
      return;
    }

    if (row.type === "epic") {
      router.push(`/dashboard/projects/${project.id}?tab=planning&sub=epics&epicId=${row.originalId}`);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeaderStrip
        icon={GanttChart}
        title="Planning Timeline"
        description="Follow sprint windows, epics, milestones, and task timing in one readable delivery timeline."
        metrics={[
          { icon: GanttChart, value: ganttQuery.data?.tasks.length ?? 0, label: "scheduled tasks", tone: "primary" },
        ]}
      />

      {ganttQuery.data ? (
        <ProjectGanttChart
          data={ganttQuery.data}
          isLoading={ganttQuery.isLoading}
          projectId={project.id}
          onRowActivate={handleRowActivate}
        />
      ) : (
        <ProjectGanttChart
          data={{ sprints: [], epics: [], tasks: [], milestones: [] }}
          isLoading={ganttQuery.isLoading}
          projectId={project.id}
          onRowActivate={handleRowActivate}
        />
      )}
    </div>
  );
}
