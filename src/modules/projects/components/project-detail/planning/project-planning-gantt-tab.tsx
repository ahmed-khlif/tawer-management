"use client";

import { useMemo, useState } from "react";
import { addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { GanttChart } from "lucide-react";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import ProjectKiboGanttChart from "../../shared/gantt/project-kibo-gantt-chart";
import GanttItemDetailsSheet from "../../shared/gantt/gantt-item-details-sheet";
import GanttFilterSheet, {
  type GanttFilters,
} from "../../shared/gantt/gantt-filter-sheet";
import useProjectTasks from "@/modules/projects/hooks/tasks/use-project-tasks";
import { resolveAssignee, type ResolvedAssignee } from "@/modules/projects/utils/resolve-assignee";
import type { ProjectType } from "@/modules/projects/types/projects";
import type { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import type { GanttRow } from "@/modules/projects/types/gantt";
import useMilestoneGantt from "@/modules/projects/hooks/milestones/use-milestone-gantt";
import type { GanttChart as ProjectGanttChart } from "@/modules/projects/types/project-milestones";

const EMPTY_GANTT_DATA: ProjectGanttChart = {
  sprints: [],
  epics: [],
  tasks: [],
  milestones: [],
};

const EMPTY_FILTERS: GanttFilters = {
  statuses: [],
};

function formatSprintOptionLabel(
  label: string | undefined,
  startDate: string | null,
  endDate: string | null,
  index: number,
) {
  if (label?.trim()) return label;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return `Sprint ${index + 1} (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`;
    }
  }

  return `Sprint ${index + 1}`;
}

function overlapsDateRange(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
  from: Date | null,
  to: Date | null,
) {
  if (!from && !to) return true;
  if (!start && !end) return false;

  const normalizedStart = start ? new Date(start) : end ? new Date(end) : null;
  const normalizedEnd = end ? new Date(end) : normalizedStart ? addDays(normalizedStart, 1) : null;

  if (!normalizedStart || !normalizedEnd) return false;
  if (Number.isNaN(normalizedStart.getTime()) || Number.isNaN(normalizedEnd.getTime())) return false;

  const rangeStart = from ?? new Date(-8640000000000000);
  const rangeEnd = to ?? new Date(8640000000000000);

  return normalizedStart <= rangeEnd && normalizedEnd >= rangeStart;
}

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
  const { tasks } = useProjectTasks(project.id);
  const [selectedRow, setSelectedRow] = useState<GanttRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<GanttFilters>(EMPTY_FILTERS);

  const rawChartData = ganttQuery.data ?? EMPTY_GANTT_DATA;

  const taskAssignees = useMemo<Record<string, ResolvedAssignee>>(() => {
    return tasks.reduce<Record<string, ResolvedAssignee>>((acc, task) => {
      const resolved = resolveAssignee(task.assigneeId, project.members);

      if (resolved) {
        acc[task.id] = resolved;
        return acc;
      }

      if (task.assignee?.name) {
        const tokens = task.assignee.name.trim().split(/\s+/).filter(Boolean);
        const initials =
          tokens.length >= 2
            ? `${tokens[0][0] ?? ""}${tokens[1][0] ?? ""}`
            : (tokens[0]?.slice(0, 2) ?? "");

        acc[task.id] = {
          name: task.assignee.name,
          initials: initials.toUpperCase() || "?",
          image: task.assignee.image,
          email: task.assignee.email,
        };
      }

      return acc;
    }, {});
  }, [project.members, tasks]);

  const taskAssigneeIds = useMemo<Record<string, string>>(
    () =>
      tasks.reduce<Record<string, string>>((acc, task) => {
        if (task.assigneeId) {
          acc[task.id] = task.assigneeId;
        }
        return acc;
      }, {}),
    [tasks],
  );

  const assigneeOptions = useMemo(
    () => {
      const seen = new Set<string>();
      return Object.entries(taskAssignees)
        .reduce<Array<{ id: string; label: string }>>((acc, [taskId, assignee]) => {
          const assigneeId = taskAssigneeIds[taskId];
          if (!assigneeId || seen.has(assigneeId)) return acc;
          seen.add(assigneeId);
          acc.push({ id: assigneeId, label: assignee.name });
          return acc;
        }, [])
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    [taskAssigneeIds, taskAssignees],
  );

  const sprintOptions = useMemo(
    () =>
      rawChartData.sprints.map((sprint, index) => ({
        id: sprint.id,
        label: formatSprintOptionLabel(sprint.name, sprint.startDate, sprint.endDate, index),
      })),
    [rawChartData.sprints],
  );

  const statusOptions = useMemo(() => {
    const seen = new Set<string>();
    return rawChartData.tasks.reduce<Array<{ id: string; label: string }>>((acc, task) => {
      if (seen.has(task.status)) return acc;
      seen.add(task.status);
      acc.push({
        id: task.status,
        label: task.status.replace(/_/g, " "),
      });
      return acc;
    }, []);
  }, [rawChartData.tasks]);

  const activeFilterCount = useMemo(
    () =>
      filters.statuses.length +
      (filters.sprintId ? 1 : 0) +
      (filters.assigneeId ? 1 : 0) +
      (filters.dateFrom || filters.dateTo ? 1 : 0),
    [filters],
  );

  const chartData = useMemo<ProjectGanttChart>(() => {
    if (activeFilterCount === 0) return rawChartData;

    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
    const epicMap = new Map(rawChartData.epics.map((epic) => [epic.id, epic]));
    const parentByTask = new Map(
      rawChartData.tasks
        .filter((task) => task.parentTaskId)
        .map((task) => [task.id, task.parentTaskId as string]),
    );

    const matchingTaskIds = new Set<string>();

    rawChartData.tasks.forEach((task) => {
      const epic = task.epicId ? epicMap.get(task.epicId) : undefined;
      const taskSprintId = task.sprintId ?? epic?.sprintId ?? undefined;
      const assigneeId = taskAssigneeIds[task.id];

      if (filters.sprintId && taskSprintId !== filters.sprintId) return;
      if (filters.assigneeId && assigneeId !== filters.assigneeId) return;
      if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) return;
      if (
        !overlapsDateRange(
          task.startDate ?? task.createdAt,
          task.dueDate ?? task.completedAt ?? task.startDate,
          dateFrom,
          dateTo,
        )
      ) {
        return;
      }

      matchingTaskIds.add(task.id);
    });

    Array.from(matchingTaskIds).forEach((taskId) => {
      let currentParentId = parentByTask.get(taskId);
      while (currentParentId) {
        matchingTaskIds.add(currentParentId);
        currentParentId = parentByTask.get(currentParentId);
      }
    });

    const filteredTasks = rawChartData.tasks.filter((task) => matchingTaskIds.has(task.id));
    const epicIdsWithTasks = new Set(filteredTasks.map((task) => task.epicId).filter(Boolean) as string[]);

    const filteredEpics = rawChartData.epics.filter((epic) => {
      if (filters.sprintId && epic.sprintId !== filters.sprintId) return false;
      if (filters.assigneeId || filters.statuses.length > 0) {
        return epicIdsWithTasks.has(epic.id);
      }
      return (
        epicIdsWithTasks.has(epic.id) ||
        overlapsDateRange(epic.startDate, epic.endDate, dateFrom, dateTo)
      );
    });

    const sprintIdsWithContent = new Set<string>();
    filteredTasks.forEach((task) => {
      const epic = task.epicId ? epicMap.get(task.epicId) : undefined;
      const sprintId = task.sprintId ?? epic?.sprintId;
      if (sprintId) sprintIdsWithContent.add(sprintId);
    });
    filteredEpics.forEach((epic) => sprintIdsWithContent.add(epic.sprintId));

    const filteredSprints = rawChartData.sprints.filter((sprint) => {
      if (filters.sprintId && sprint.id !== filters.sprintId) return false;
      if (!overlapsDateRange(sprint.startDate, sprint.endDate, dateFrom, dateTo)) return false;
      if (filters.assigneeId || filters.statuses.length > 0 || filters.sprintId) {
        return sprintIdsWithContent.has(sprint.id);
      }
      return sprintIdsWithContent.has(sprint.id);
    });

    const filteredMilestones = rawChartData.milestones.filter((milestone) => {
      if (filters.assigneeId || filters.sprintId) return false;
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(milestone.status)
      ) {
        return false;
      }
      return overlapsDateRange(
        milestone.dueDate ?? milestone.completedAt,
        milestone.dueDate ?? milestone.completedAt,
        dateFrom,
        dateTo,
      );
    });

    return {
      sprints: filteredSprints,
      epics: filteredEpics,
      tasks: filteredTasks,
      milestones: filteredMilestones,
    };
  }, [activeFilterCount, filters, rawChartData, taskAssigneeIds]);

  const handleOpenFullView = (row: GanttRow) => {
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

  const handleRowActivate = (row: GanttRow) => {
    setSelectedRow(row);
    setIsDetailsOpen(true);
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

      <ProjectKiboGanttChart
        data={chartData}
        isLoading={ganttQuery.isLoading}
        projectId={project.id}
        onRowActivate={handleRowActivate}
        taskAssignees={taskAssignees}
        filterContent={
          <GanttFilterSheet
            filters={filters}
            sprintOptions={sprintOptions}
            assigneeOptions={assigneeOptions}
            statusOptions={statusOptions}
            onChange={setFilters}
            onClear={() => setFilters(EMPTY_FILTERS)}
          />
        }
        activeFilterCount={activeFilterCount}
        hasActiveFilters={activeFilterCount > 0}
      />

      <GanttItemDetailsSheet
        open={isDetailsOpen}
        row={selectedRow}
        data={chartData}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) {
            setSelectedRow(null);
          }
        }}
        onOpenFullView={handleOpenFullView}
      />
    </div>
  );
}
