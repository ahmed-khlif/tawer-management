"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Flag, Plus, Activity, AlertCircle, CheckCircle2, LayoutGrid, GanttChart, SlidersHorizontal, CheckCircle, Clock, ShieldAlert, ShieldCheck, ShieldEllipsis, Search } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import useMilestoneGantt from "@/modules/projects/hooks/milestones/use-milestone-gantt";
import useProjectMilestones from "@/modules/projects/hooks/milestones/use-project-milestones";
import useMilestoneUpload from "@/modules/projects/hooks/milestones/use-milestone-upload";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { ProjectType } from "@/modules/projects/types/projects";
import { Milestone } from "@/modules/projects/types/project-milestones";
import type { GanttRow } from "@/modules/projects/types/gantt";
import MilestoneCard from "./milestone-card";
import MilestoneDetailSheet from "./milestone-detail-sheet";
import ProjectGanttChart from "../../shared/gantt/project-gantt-chart";
import MilestoneUploadSheet from "./milestone-upload-sheet";
import { EmptyState } from "../../shared/empty-state";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import { Toolbar } from "../../shared/toolbar";
import { FilterMenu, type FilterMenuCategory } from "../../shared/filter-menu";

interface ProjectMilestonesProps {
  project: ProjectType;
  permissions: ProjectPermissions;
}

function isOverdue(milestone: Milestone): boolean {
  if (milestone.completedAt) return false;
  if (!milestone.dueDate) return false;
  return new Date(milestone.dueDate).getTime() < Date.now();
}

export default function ProjectMilestones({
  project,
  permissions,
}: ProjectMilestonesProps) {
  const router = useRouter();
  const [view, setView] = useState<"list" | "grid" | "gantt">("grid");
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [selectedMilestone, setSelectedMilestone] =
    useState<Milestone | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const milestonesQuery = useProjectMilestones(project.id, {
    page: 1,
    limit: 50,
  });
  const ganttQuery = useMilestoneGantt(project.id);
  const { deleteMilestone, completeMilestone } = useMilestoneUpload(project.id);

  const milestones = useMemo(() => {
    let source = milestonesQuery.data?.data ?? [];

    // Search
    if (search) {
      source = source.filter((m) =>
        `${m.name} ${m.description ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }

    // Status
    if (selectedStatuses.length > 0) {
      source = source.filter((m) => {
        const isComp = !!m.completedAt;
        const isOver = isOverdue(m);
        if (selectedStatuses.includes("completed") && isComp) return true;
        if (selectedStatuses.includes("overdue") && isOver) return true;
        if (selectedStatuses.includes("pending") && !isComp && !isOver) return true;
        return false;
      });
    }

    // Risk Level
    if (selectedRisks.length > 0) {
      source = source.filter((m) => m.aiRiskLevel && selectedRisks.includes(m.aiRiskLevel));
    }

    // Sort
    if (sortBy === "dueDateAsc") {
      source = [...source].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === "dueDateDesc") {
      source = [...source].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      });
    } else if (sortBy === "nameAsc") {
      source = [...source].sort((a, b) => a.name.localeCompare(b.name));
    }

    return source;
  }, [milestonesQuery.data?.data, search, selectedStatuses, selectedRisks, sortBy]);

  const total = milestonesQuery.data?.pagination.records ?? 0;
  const completed = milestones.filter((m) => !!m.completedAt).length;
  const overdue = milestones.filter(isOverdue).length;

  const milestoneSortLabelMap: Record<string, string> = {
    dueDateAsc: "Due date (oldest)",
    dueDateDesc: "Due date (newest)",
    nameAsc: "Name (A-Z)",
  };

  const toggleStatus = (id: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleRisk = (id: string) => {
    setSelectedRisks((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedRisks([]);
    setSortBy(undefined);
  };

  const filterCategories: FilterMenuCategory[] = [
    {
      id: "status",
      label: "Status",
      icon: Activity,
      multiple: true,
      options: [
        { id: "pending", label: "Pending", icon: Clock },
        { id: "overdue", label: "Overdue", icon: AlertCircle, iconClassName: "text-destructive" },
        { id: "completed", label: "Completed", icon: CheckCircle, iconClassName: "text-success" },
      ],
      selectedIds: selectedStatuses,
      onToggle: toggleStatus,
    },
    {
      id: "risk",
      label: "AI Risk Level",
      icon: AlertCircle,
      multiple: true,
      options: [
        { id: "LOW", label: "Low Risk", icon: ShieldCheck, iconClassName: "text-success" },
        { id: "MEDIUM", label: "Medium Risk", icon: ShieldEllipsis, iconClassName: "text-warning" },
        { id: "HIGH", label: "High Risk", icon: ShieldAlert, iconClassName: "text-destructive" },
      ],
      selectedIds: selectedRisks,
      onToggle: toggleRisk,
    },
    {
      id: "sort",
      label: "Sort By",
      icon: SlidersHorizontal,
      options: [
        { id: "dueDateAsc", label: "Due date (oldest)" },
        { id: "dueDateDesc", label: "Due date (newest)" },
        { id: "nameAsc", label: "Name (A-Z)" },
      ],
      selectedIds: sortBy ? [sortBy] : [],
      onToggle: (id) => setSortBy(id === sortBy ? undefined : id),
    },
  ];

  const activeFilters = [
    ...selectedStatuses.map((id) => ({
      id: `status-${id}`,
      prefix: "Status:",
      label: id.charAt(0).toUpperCase() + id.slice(1),
      onRemove: () => toggleStatus(id),
    })),
    ...selectedRisks.map((id) => ({
      id: `risk-${id}`,
      prefix: "Risk:",
      label: id.charAt(0).toUpperCase() + id.slice(1).toLowerCase(),
      onRemove: () => toggleRisk(id),
    })),
    ...(sortBy
      ? [
          {
            id: "sortBy",
            prefix: "Sort:",
            label: milestoneSortLabelMap[sortBy] ?? sortBy,
            onRemove: () => setSortBy(undefined),
          },
        ]
      : []),
  ];

  const activeFilterCount = selectedStatuses.length + selectedRisks.length + (sortBy ? 1 : 0);

  const handleGanttRowActivate = (row: GanttRow) => {
    if (row.type === "milestone") {
      const milestone = (milestonesQuery.data?.data ?? []).find(
        (item) => item.id === row.originalId,
      );
      if (milestone) {
        setSelectedMilestone(milestone);
      }
      return;
    }

    if (row.type === "task") {
      router.push(
        `/dashboard/projects/${project.id}?tab=board&taskId=${row.originalId}`,
      );
    }
  };

  return (
    <div className="space-y-4">
      <PageHeaderStrip
        icon={Flag}
        title="Milestones"
        description="Track key delivery checkpoints across this project."
        metrics={[
          { icon: Activity, value: total, label: "total" },
          completed > 0
            ? {
                icon: CheckCircle2,
                value: completed,
                label: "completed",
                tone: "success",
              }
            : false,
          overdue > 0
            ? {
                icon: AlertCircle,
                value: overdue,
                label: "overdue",
                tone: "destructive",
              }
            : false,
        ]}
        actions={
          <PermissionGuard allowed={permissions.canCreateMilestone}>
            <Button
              size="sm"
              onClick={() => {
                setEditingMilestone(null);
                setSheetOpen(true);
              }}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              Create milestone
            </Button>
          </PermissionGuard>
        }
      />
      <Toolbar
        tabs={
          <Tabs
            value={selectedStatuses.length === 1 ? selectedStatuses[0] : selectedStatuses.length === 0 ? "all" : ""}
            onValueChange={(val) => {
              if (val === "all") setSelectedStatuses([]);
              else setSelectedStatuses([val]);
            }}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        }
        search={search}
        onSearchChange={setSearch}
        viewMode={view}
        onViewModeChange={setView}
        showGantt={true}
        filterContent={<FilterMenu categories={filterCategories} />}
        activeFilterCount={activeFilterCount}
        activeFilters={activeFilters}
        onClearAllFilters={activeFilterCount > 0 ? clearAllFilters : undefined}
      />

      {view === "gantt" ? (
        <ProjectGanttChart
          data={ganttQuery.data!}
          isLoading={ganttQuery.isLoading}
          projectId={project.id}
          onRowActivate={handleGanttRowActivate}
        />
      ) : milestonesQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full" />
          ))}
        </div>
      ) : milestonesQuery.error ? (
        <ErrorBanner
          error="Unable to load milestones."
          onRetry={() => void milestonesQuery.refetch()}
        />
      ) : milestones.length === 0 ? (
        search ? (
          <EmptyState
            icon={Search}
            message="No milestones match your search"
            description={`Nothing matches "${search}". Try clearing your search or creating a new milestone.`}
            action={
              <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Flag}
            message="No milestones yet"
            description="Track key delivery checkpoints across this project to stay on schedule."
            action={
              <PermissionGuard allowed={permissions.canCreateMilestone}>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingMilestone(null);
                    setSheetOpen(true);
                  }}
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Create milestone
                </Button>
              </PermissionGuard>
            }
          />
        )
      ) : view === "list" ? (
        <div className="flex flex-col gap-3">
          <div className="hidden md:flex items-center gap-6 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/50">
            <div className="w-10 shrink-0 text-center">Status</div>
            <div className="grow">Milestone Details</div>
            <div className="flex items-center gap-8 px-4 h-full">
              <div className="min-w-[100px]">Due Date</div>
              <div className="min-w-[80px]">Tasks</div>
            </div>
            <div className="w-32 shrink-0">Progress</div>
            <div className="ml-auto w-24 text-right">Actions</div>
          </div>
          <div className="flex flex-col gap-3">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              permissions={permissions}
              viewMode="list"
              onOpen={setSelectedMilestone}
              onEdit={(value) => {
                setEditingMilestone(value);
                setSheetOpen(true);
              }}
              onDelete={(value) => deleteMilestone.mutate(value.id)}
              onComplete={(value) => completeMilestone.mutate(value.id)}
            />
          ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              permissions={permissions}
              viewMode="grid"
              onOpen={setSelectedMilestone}
              onEdit={(value) => {
                setEditingMilestone(value);
                setSheetOpen(true);
              }}
              onDelete={(value) => deleteMilestone.mutate(value.id)}
              onComplete={(value) => completeMilestone.mutate(value.id)}
            />
          ))}
        </div>
      )}

      <MilestoneUploadSheet
        projectId={project.id}
        milestone={editingMilestone}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
      <MilestoneDetailSheet
        projectId={project.id}
        milestone={selectedMilestone}
        open={!!selectedMilestone}
        onOpenChange={(open) => !open && setSelectedMilestone(null)}
        onEdit={permissions.canEditMilestone ? (value) => {
          setSelectedMilestone(null);
          setEditingMilestone(value);
          setSheetOpen(true);
        } : undefined}
        onComplete={(value) => completeMilestone.mutate(value.id)}
        isCompleting={completeMilestone.isPending}
        canComplete={permissions.canCompleteMilestone}
        canCreateReminder={permissions.canCreateReminder}
        canCreateTask={permissions.canCreateTask}
        onCreateTask={(value) => {
          setSelectedMilestone(null);
          router.push(
            `/dashboard/projects/${project.id}?tab=board&milestoneId=${value.id}&newTask=1`,
          );
        }}
      />
    </div>
  );
}
