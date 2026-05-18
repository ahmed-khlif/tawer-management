"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { CircleDot, BarChart3, Tag, ListChecks, Activity, FolderKanban, Sparkles } from "lucide-react";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";

import useAssignedProjectTasks from "../../hooks/tasks/use-assigned-project-tasks";
import ProjectTaskItem from "../project-detail/project-task/project-task-item";
import ProjectTaskDetailSheet from "../project-detail/project-task/project-task-details-sheet";
import ProjectTaskUploadSheet from "../project-detail/project-task/project-task-upload";
import {
  ProjectTaskType,
  EnumProjectTaskStatus,
  EnumProjectTaskPriority,
  EnumProjectTaskType,
} from "../../types/project-tasks";
import {
  projectTaskStatusDotColors,
  projectTaskPriorityDotColors,
} from "../../utils/badges/project-task-badges";
import MyWorkloadSummaryCard from "./my-workload-summary-card";
import {
  Toolbar,
  type ToolbarFilterChip,
  type ToolbarTextOverrides,
} from "../shared/toolbar";
import {
  FilterMenu,
  type FilterMenuCategory,
} from "../shared/filter-menu";
import { PageHeaderStrip } from "../shared/page-header-strip";
import AdminPageShell from "../shared/admin-page-shell";
import { EmptyState } from "../shared/empty-state";
import { retrieveProjects } from "../../services";

type ViewMode = "list" | "grid";

export default function AssignedProjectTasks() {
  const t = useTranslations("modules.projects.tasks");

  const { tasks, tasksAreLoading, tasksError, searchState, projectIdState, statusState, priorityState, typeState } = useAssignedProjectTasks();
  const [search, setSearch] = searchState;
  const [projectId, setProjectId] = projectIdState;
  const [status, setStatus] = statusState;
  const [priority, setPriority] = priorityState;
  const [type, setType] = typeState;

  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [selectedTask, setSelectedTask] = React.useState<ProjectTaskType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const { data: projectsResponse } = useQuery({
    queryKey: ["assigned-project-task-filter-projects"],
    queryFn: () => retrieveProjects({ page: 1, limit: 100, sortBy: "createdAtDesc" }),
    staleTime: 5 * 60 * 1000,
  });
  const projects = projectsResponse?.data ?? [];

  const handleSelectTask = (task: ProjectTaskType) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedTask(null);
  };

  const clearFilters = () => {
    setSearch("");
    setProjectId(undefined);
    setStatus(undefined);
    setPriority(undefined);
    setType(undefined);
  };

  const activeFilterCount = (projectId ? 1 : 0) + (status ? 1 : 0) + (priority ? 1 : 0) + (type ? 1 : 0);

  const filterCategories: FilterMenuCategory[] = [
    {
      id: "project",
      label: "Project",
      icon: FolderKanban,
      multiple: false,
      selectedIds: projectId ? [projectId] : [],
      onClear: () => setProjectId(undefined),
      onToggle: (id) => setProjectId(projectId === id ? undefined : id),
      options: projects.map((project) => ({
        id: project.id,
        label: project.name,
      })),
    },
    {
      id: "status",
      label: t("filters.status"),
      icon: CircleDot,
      multiple: false,
      selectedIds: status ? [status] : [],
      onClear: () => setStatus(undefined),
      onToggle: (id) =>
        setStatus(
          status === (id as EnumProjectTaskStatus)
            ? undefined
            : (id as EnumProjectTaskStatus),
        ),
      options: Object.values(EnumProjectTaskStatus).map((s) => ({
        id: s,
        label: t(`statusLabels.${s.toLowerCase()}`),
        dotColorClass: projectTaskStatusDotColors[s],
      })),
    },
    {
      id: "priority",
      label: t("filters.priority"),
      icon: BarChart3,
      multiple: false,
      selectedIds: priority ? [priority] : [],
      onClear: () => setPriority(undefined),
      onToggle: (id) =>
        setPriority(
          priority === (id as EnumProjectTaskPriority)
            ? undefined
            : (id as EnumProjectTaskPriority),
        ),
      options: Object.values(EnumProjectTaskPriority).map((p) => ({
        id: p,
        label: t(`priorityLabels.${p.toLowerCase()}`),
        dotColorClass: projectTaskPriorityDotColors[p],
      })),
    },
    {
      id: "type",
      label: t("filters.type"),
      icon: Tag,
      multiple: false,
      selectedIds: type ? [type] : [],
      onClear: () => setType(undefined),
      onToggle: (id) =>
        setType(
          type === (id as EnumProjectTaskType)
            ? undefined
            : (id as EnumProjectTaskType),
        ),
      options: Object.values(EnumProjectTaskType).map((tp) => ({
        id: tp,
        label: t(`types.${tp.toLowerCase()}`),
      })),
    },
  ];

  const filterContent = <FilterMenu categories={filterCategories} />;

  const activeFilterChips: ToolbarFilterChip[] = React.useMemo(() => {
    const chips: ToolbarFilterChip[] = [];
    if (projectId) {
      chips.push({
        id: "project",
        prefix: "Project:",
        label: projects.find((project) => project.id === projectId)?.name ?? projectId,
        onRemove: () => setProjectId(undefined),
      });
    }
    if (status) {
      chips.push({
        id: "status",
        prefix: `${t("filters.status")}:`,
        label: t(`statusLabels.${status.toLowerCase()}`),
        onRemove: () => setStatus(undefined),
      });
    }
    if (priority) {
      chips.push({
        id: "priority",
        prefix: `${t("filters.priority")}:`,
        label: t(`priorityLabels.${priority.toLowerCase()}`),
        onRemove: () => setPriority(undefined),
      });
    }
    if (type) {
      chips.push({
        id: "type",
        prefix: `${t("filters.type")}:`,
        label: t(`types.${type.toLowerCase()}`),
        onRemove: () => setType(undefined),
      });
    }
    return chips;
  }, [projectId, status, priority, type, projects, setProjectId, setStatus, setPriority, setType, t]);

  const textOverrides: ToolbarTextOverrides = {
    filtersButton: t("filters.title", { defaultValue: "Filters" }),
    activeFiltersHeading: t("filters.activeHeading", { defaultValue: "Filters" }),
    clearAll: t("filters.clearFilters", { defaultValue: "Clear all" }),
    viewList: t("toolbar.listView", { defaultValue: "List view" }),
    viewGrid: t("toolbar.gridView", { defaultValue: "Grid view" }),
    filterTooltip: t("filters.title", { defaultValue: "Filters" }),
  };

  return (
    <AdminPageShell className="space-y-4">
      <PageHeaderStrip
        icon={ListChecks}
        title={t("pageTitle")}
        description="Review project work assigned to you with the same planning-first layout used across the PM workspace."
        metrics={[
          {
            icon: Activity,
            value: tasks.length,
            label: "visible tasks",
            tone: "primary",
          },
          projectId
            ? {
                icon: FolderKanban,
                label: projects.find((project) => project.id === projectId)?.name ?? "Selected project",
                tone: "info",
              }
            : false,
          status
            ? {
                icon: CircleDot,
                label: t(`statusLabels.${status.toLowerCase()}`),
                tone: "running",
              }
            : false,
          priority
            ? {
                icon: BarChart3,
                label: t(`priorityLabels.${priority.toLowerCase()}`),
                tone: "warning",
              }
            : false,
        ]}
      />

      {/* Workload summary */}
      <MyWorkloadSummaryCard />

      {/* Toolbar */}
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("upload.form.placeholders.search")}
        filterContent={filterContent}
        activeFilterCount={activeFilterCount}
        activeFilters={activeFilterChips}
        onClearAllFilters={activeFilterCount > 0 ? clearFilters : undefined}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        textOverrides={textOverrides}
        sticky={false}
        className="rounded-xl border border-border/70 bg-card/90 px-3 py-2 shadow-sm sm:px-4"
      />

      {/* Content */}
      {tasksError ? (
        <Error500 />
      ) : tasksAreLoading ? (
        <Loading />
      ) : tasks.length === 0 ? (
        <EmptyState
          message="No assigned project tasks found"
          description={
            projectId
              ? "Try another project or clear the active filters to bring back more assigned work."
              : "You are all caught up. When project work is assigned to you, it will appear here."
          }
          icon={Sparkles}
          className="min-h-[calc(100vh-18rem)]"
        />
      ) : viewMode === "grid" ? (
        <div className="rounded-2xl border border-border/70 bg-card/40 p-3 shadow-sm sm:p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <ProjectTaskItem key={task.id} task={task} projectType="AGILE" viewMode="grid" onClick={() => handleSelectTask(task)} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border border-border/70 bg-card/50 p-3 shadow-sm">
          {tasks.map((task) => (
            <ProjectTaskItem key={task.id} task={task} projectType="AGILE" viewMode="list" onClick={() => handleSelectTask(task)} />
          ))}
        </div>
      )}

      {/* Detail sheet */}
      <ProjectTaskDetailSheet
        projectId={selectedTask?.projectId ?? ""}
        isOpen={isDetailOpen && !isEditOpen}
        onClose={handleCloseDetail}
        task={selectedTask}
        onEditClick={() => setIsEditOpen(true)}
      />

      {/* Edit sheet */}
      {selectedTask && (
        <ProjectTaskUploadSheet
          projectId={selectedTask.projectId}
          isOpen={isEditOpen}
          onClose={() => { setIsEditOpen(false); setIsDetailOpen(false); setSelectedTask(null); }}
          task={selectedTask}
          isAgile={true}
        />
      )}
    </AdminPageShell>
  );
}
