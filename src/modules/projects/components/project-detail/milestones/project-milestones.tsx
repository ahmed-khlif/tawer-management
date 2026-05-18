"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Flag, Plus, Activity, AlertCircle, CheckCircle2, LayoutGrid, SlidersHorizontal, CheckCircle, Clock, ShieldAlert, ShieldCheck, ShieldEllipsis, Search, CalendarClock, Sparkles, ListChecks } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { PermissionGuard } from "@/components/permission-guard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import useProjectMilestones from "@/modules/projects/hooks/milestones/use-project-milestones";
import useMilestoneUpload from "@/modules/projects/hooks/milestones/use-milestone-upload";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { ProjectType } from "@/modules/projects/types/projects";
import { Milestone } from "@/modules/projects/types/project-milestones";
import MilestoneCard from "./milestone-card";
import MilestoneDetailSheet from "./milestone-detail-sheet";
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

function getMilestoneTone(milestone: Milestone) {
  if (milestone.completedAt) {
    return {
      label: "Completed",
      dot: "bg-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    };
  }
  if (isOverdue(milestone)) {
    return {
      label: "Overdue",
      dot: "bg-destructive",
      badge: "bg-destructive/10 text-destructive border-destructive/20",
    };
  }
  if (milestone.progress > 0) {
    return {
      label: "In Progress",
      dot: "bg-primary",
      badge: "bg-primary/10 text-primary border-primary/20",
    };
  }
  return {
    label: "Upcoming",
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
}

export default function ProjectMilestones({
  project,
  permissions,
}: ProjectMilestonesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"list" | "grid">("grid");
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
  const { deleteMilestone, completeMilestone } = useMilestoneUpload(project.id);
  const selectedMilestoneId = searchParams.get("milestoneId");

  React.useEffect(() => {
    if (!selectedMilestoneId) {
      return;
    }

    const matchedMilestone = (milestonesQuery.data?.data ?? []).find(
      (milestone) => milestone.id === selectedMilestoneId,
    );
    if (matchedMilestone) {
      setSelectedMilestone(matchedMilestone);
    }
  }, [milestonesQuery.data?.data, selectedMilestoneId]);

  const closeSelectedMilestone = React.useCallback(() => {
    setSelectedMilestone(null);
    if (!selectedMilestoneId) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("milestoneId");
    router.replace(
      params.size > 0 ? `${pathname}?${params.toString()}` : pathname,
    );
  }, [pathname, router, searchParams, selectedMilestoneId]);

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
  const inProgress = milestones.filter(
    (m) => !m.completedAt && !isOverdue(m) && m.progress > 0,
  ).length;
  const timelineMilestones = useMemo(
    () =>
      [...milestones]
        .filter((milestone) => milestone.dueDate)
        .sort(
          (a, b) =>
            new Date(a.dueDate as string).getTime() -
            new Date(b.dueDate as string).getTime(),
        )
        .slice(0, 8),
    [milestones],
  );
  const currentTimelineMilestone =
    timelineMilestones.find(
      (milestone) => !milestone.completedAt && !isOverdue(milestone),
    ) ?? timelineMilestones[0];

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
          inProgress > 0
            ? {
                icon: Clock,
                value: inProgress,
                label: "active",
                tone: "running",
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

      {timelineMilestones.length > 0 ? (
        <Card className="overflow-hidden border-border/60">
          <CardHeader className="flex flex-row items-start justify-between gap-3 border-b bg-muted/20">
            <div>
              <CardTitle className="text-base">Timeline overview</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Follow milestone timing, current focus, and task-backed progress in one place.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full text-[10px] font-semibold uppercase tracking-wide">
                <CalendarClock className="mr-1 size-3.5" />
                {timelineMilestones.length} milestones on track
              </Badge>
              {currentTimelineMilestone ? (
                <Badge variant="outline" className="rounded-full text-[10px] font-semibold uppercase tracking-wide">
                  <Sparkles className="mr-1 size-3.5" />
                  Current: {currentTimelineMilestone.name}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <div className="relative overflow-x-auto pb-2">
              <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-primary/10" />
              <div className="relative flex min-w-[720px] items-start justify-between gap-4">
                {timelineMilestones.map((milestone) => {
                  const tone = getMilestoneTone(milestone);
                  const isCurrent = currentTimelineMilestone?.id === milestone.id;
                  return (
                    <button
                      key={milestone.id}
                      type="button"
                      onClick={() => setSelectedMilestone(milestone)}
                      className="group relative flex w-40 flex-col items-center text-center"
                    >
                      <div
                        className={cn(
                          "relative z-[1] flex size-10 items-center justify-center rounded-full border-4 border-background shadow-sm transition-transform group-hover:scale-105",
                          tone.dot,
                          isCurrent && "ring-4 ring-primary/15",
                        )}
                      >
                        <Flag className="size-4 text-white" />
                      </div>
                      <div className="mt-3 space-y-1">
                        <p
                          className={cn(
                            "text-xs font-semibold",
                            isCurrent ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {milestone.dueDate ? format(new Date(milestone.dueDate), "MMM dd") : "No date"}
                        </p>
                        <p className="line-clamp-2 text-sm font-semibold leading-tight">
                          {milestone.name}
                        </p>
                        <Badge variant="outline" className={cn("rounded-full text-[10px] font-semibold", tone.badge)}>
                          {tone.label}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {timelineMilestones.slice(0, 4).map((milestone) => {
                const tone = getMilestoneTone(milestone);
                return (
                  <button
                    key={`${milestone.id}-summary`}
                    type="button"
                    onClick={() => setSelectedMilestone(milestone)}
                    className="rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-muted/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="line-clamp-1 text-sm font-semibold">{milestone.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {milestone.dueDate
                            ? format(new Date(milestone.dueDate), "PPP")
                            : "No due date"}
                        </p>
                      </div>
                      <span className={cn("mt-1 size-2.5 rounded-full", tone.dot)} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <ListChecks className="size-3.5" />
                        {milestone.doneTasks}/{milestone.totalTasks} tasks
                      </span>
                      <span className="font-semibold text-foreground">
                        {Math.round(milestone.progress)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}
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
        filterContent={<FilterMenu categories={filterCategories} />}
        activeFilterCount={activeFilterCount}
        activeFilters={activeFilters}
        onClearAllFilters={activeFilterCount > 0 ? clearAllFilters : undefined}
      />

      {milestonesQuery.isLoading ? (
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
        onOpenChange={(open) => !open && closeSelectedMilestone()}
        onEdit={permissions.canEditMilestone ? (value) => {
          closeSelectedMilestone();
          setEditingMilestone(value);
          setSheetOpen(true);
        } : undefined}
        onComplete={(value) => completeMilestone.mutate(value.id)}
        isCompleting={completeMilestone.isPending}
        canComplete={permissions.canCompleteMilestone}
        canCreateReminder={permissions.canCreateReminder}
        canCreateTask={permissions.canCreateTask}
        onCreateTask={(value) => {
          closeSelectedMilestone();
          router.push(
            `/dashboard/projects/${project.id}?tab=tasks&sub=kanban&milestoneId=${value.id}&newTask=1`,
          );
        }}
      />
    </div>
  );
}
