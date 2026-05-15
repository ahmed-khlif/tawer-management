"use client";
import React from "react";
import { Plus, Calendar, Sparkles, TrendingUp, Activity, Clock, CheckCircle2, XCircle, Ban, SlidersHorizontal, Globe, Hourglass, Scale, Layers, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Error500 from "@/components/error/500";
import { CardGridSkeleton } from "../../shared/skeletons";
import { ProjectType } from "@/modules/projects/types/projects";
import {
  SprintType,
  SprintStatus,
} from "@/modules/projects/types/project-sprints";
import { deleteSprint, uploadSprint } from "@/modules/projects/services";
import useProjectSprints from "@/modules/projects/hooks/sprints/use-project-sprints";
import useProjectPermissions from "@/modules/projects/hooks/permissions/use-project-permissions";
import useSprintVelocity from "@/modules/projects/hooks/sprints/use-sprint-velocity";
import SprintCard from "./sprint-card";
import SprintDetailSheet from "./sprint-detail-sheet";
import SprintUploadSheet from "./sprint-upload-sheet";
import SprintVelocityChart from "./sprint-velocity-chart";
import { Toolbar, type ToolbarFilterChip } from "../../shared/toolbar";
import { FilterMenu, type FilterMenuCategory } from "../../shared/filter-menu";
import { EmptyState } from "../../shared/empty-state";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import useMilestoneGantt from "@/modules/projects/hooks/milestones/use-milestone-gantt";

interface Props {
  project: ProjectType;
}

export default function ProjectSprints({ project }: Props) {
  const t = useTranslations("modules.projects.sprints");
  const queryClient = useQueryClient();

  const {
    sprints,
    sprintsAreLoading,
    sprintsError,
    statusState,
    searchState,
    sortByState,
    languageState,
    hasCapacityState,
    durationState,
  } = useProjectSprints(project.id);
  const { canManageSprints } = useProjectPermissions(project);
  const velocityQuery = useSprintVelocity(project.id);
  const [status, setStatus] = statusState;
  const [search, setSearch] = searchState;
  const [sortBy, setSortBy] = sortByState;
  const [language, setLanguage] = languageState;
  const [hasCapacity, setHasCapacity] = hasCapacityState;
  const [duration, setDuration] = durationState;
  const runningSprintExists = sprints.some((s) => s.status === "Running");

  const [viewMode, setViewMode] = React.useState<"grid" | "list" | "gantt">("grid");
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editSprint, setEditSprint] = React.useState<SprintType | null>(null);
  const [selectedSprint, setSelectedSprint] = React.useState<SprintType | null>(
    null,
  );
  const [sprintToDelete, setSprintToDelete] = React.useState<SprintType | null>(
    null,
  );

  const hasActiveFilters = (status || sortBy || language || hasCapacity !== undefined || duration);

  const sprintSortLabelMap: Record<string, string> = {
    startDateAsc: t("filters.startDateAsc", { defaultValue: "Start date (oldest)" }),
    startDateDesc: t("filters.startDateDesc", { defaultValue: "Start date (newest)" }),
    endDateAsc: t("filters.endDateAsc", { defaultValue: "End date (oldest)" }),
    endDateDesc: t("filters.endDateDesc", { defaultValue: "End date (newest)" }),
  };

  const activeFilterChips: ToolbarFilterChip[] = [
    ...(status
      ? [
          {
            id: "status",
            prefix: t("filters.status", { defaultValue: "Status" }) + ":",
            label: status,
            onRemove: () => setStatus(undefined),
          },
        ]
      : []),
    ...(sortBy
      ? [
          {
            id: "sortBy",
            prefix: t("filters.sortBy", { defaultValue: "Sort" }) + ":",
            label: sprintSortLabelMap[sortBy] ?? sortBy,
            onRemove: () => setSortBy(undefined),
          },
        ]
      : []),
    ...(language
      ? [
          {
            id: "language",
            prefix: t("filters.language", { defaultValue: "Language" }) + ":",
            label: language,
            onRemove: () => setLanguage(undefined),
          },
        ]
      : []),
    ...(hasCapacity !== undefined
      ? [
          {
            id: "hasCapacity",
            prefix: t("filters.capacity", { defaultValue: "Capacity" }) + ":",
            label: hasCapacity ? t("filters.withCapacity") : t("filters.withoutCapacity"),
            onRemove: () => setHasCapacity(undefined),
          },
        ]
      : []),
    ...(duration
      ? [
          {
            id: "duration",
            prefix: t("filters.duration", { defaultValue: "Duration" }) + ":",
            label: t(`filters.durationOptions.${duration}`),
            onRemove: () => setDuration(undefined),
          },
        ]
      : []),
  ];

  const handleDelete = async () => {
    if (!sprintToDelete) return;
    try {
      await deleteSprint(project.id, sprintToDelete.id);
      queryClient.invalidateQueries({
        queryKey: ["project-sprints", project.id],
      });
      toast.success(
        t("deleteDialog.successToast", { defaultValue: "Sprint deleted" }),
      );
    } catch {
      toast.error(
        t("deleteDialog.errorToast", {
          defaultValue: "Failed to delete sprint",
        }),
      );
    } finally {
      setSprintToDelete(null);
    }
  };

  const handleStatusChange = async (
    sprint: SprintType,
    nextStatus: SprintStatus,
  ) => {
    if (
      nextStatus === "Running" &&
      runningSprintExists &&
      sprint.status !== "Running"
    ) {
      toast.error(
        t("statusToast.alreadyRunning", {
          defaultValue:
            "Another sprint is already running. Stop or complete it before starting a new one.",
        }),
      );
      return;
    }
    try {
      await uploadSprint(project.id, { status: nextStatus }, sprint.id);
      queryClient.invalidateQueries({
        queryKey: ["project-sprints", project.id],
      });
      toast.success(
        t(`statusToast.${nextStatus.toLowerCase()}`, {
          defaultValue: `Sprint ${nextStatus.toLowerCase()}`,
        }),
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        t("statusToast.error", { defaultValue: "Failed to update sprint status" });
      toast.error(msg);
    }
  };

  const filterCategories: FilterMenuCategory[] = [
    {
      id: "status",
      label: t("filters.status", { defaultValue: "Status" }),
      icon: Activity,
      options: [
        { id: "Pending", label: t("statusTabs.pending"), icon: Clock },
        { id: "Running", label: t("statusTabs.running"), icon: Activity, iconClassName: "text-running" },
        { id: "Stopped", label: t("statusTabs.stopped"), icon: Ban, iconClassName: "text-destructive" },
        { id: "Completed", label: t("statusTabs.completed"), icon: CheckCircle2, iconClassName: "text-success" },
      ],
      selectedIds: status ? [status] : [],
      onToggle: (id) => setStatus(id === status ? undefined : (id as SprintStatus)),
    },
    {
      id: "sort",
      label: t("filters.sortBy", { defaultValue: "Sort By" }),
      icon: SlidersHorizontal,
      options: [
        { id: "startDateAsc", label: t("filters.startDateAsc") },
        { id: "startDateDesc", label: t("filters.startDateDesc") },
        { id: "endDateAsc", label: t("filters.endDateAsc") },
        { id: "endDateDesc", label: t("filters.endDateDesc") },
      ],
      selectedIds: sortBy ? [sortBy] : [],
      onToggle: (id) => setSortBy(id === sortBy ? undefined : id),
    },
    {
      id: "language",
      label: t("filters.language", { defaultValue: "Language" }),
      icon: Globe,
      options: [
        { id: "Arabic", label: "Arabic" },
        { id: "French", label: "French" },
        { id: "English", label: "English" },
      ],
      selectedIds: language ? [language] : [],
      onToggle: (id) => setLanguage(id === language ? undefined : id),
    },
    {
      id: "capacity",
      label: t("filters.capacity", { defaultValue: "Capacity" }),
      icon: Scale,
      options: [
        { id: "true", label: t("filters.withCapacity") },
        { id: "false", label: t("filters.withoutCapacity") },
      ],
      selectedIds: hasCapacity !== undefined ? [String(hasCapacity)] : [],
      onToggle: (id) => {
        const boolVal = id === "true";
        setHasCapacity(hasCapacity === boolVal ? undefined : boolVal);
      },
    },
    {
      id: "duration",
      label: t("filters.duration", { defaultValue: "Duration" }),
      icon: Hourglass,
      options: [
        { id: "short", label: t("filters.durationOptions.short") },
        { id: "medium", label: t("filters.durationOptions.medium") },
        { id: "long", label: t("filters.durationOptions.long") },
      ],
      selectedIds: duration ? [duration] : [],
      onToggle: (id) => setDuration(id === duration ? undefined : id),
    },
  ];

  const clearAllFilters = () => {
    setStatus(undefined);
    setSortBy(undefined);
    setLanguage(undefined);
    setHasCapacity(undefined);
    setDuration(undefined);
  };

  if (sprintsError) return <Error500 />;

  // Compute summary metrics for the header
  const counts = sprints.reduce(
    (acc, s) => {
      acc.total += 1;
      acc[s.status.toLowerCase() as keyof typeof acc] =
        (acc[s.status.toLowerCase() as keyof typeof acc] || 0) + 1;
      return acc;
    },
    { total: 0, running: 0, pending: 0, completed: 0, stopped: 0 } as Record<
      string,
      number
    >,
  );

  const velocityData = velocityQuery.data;
  const hasVelocityNumbers =
    !!velocityData &&
    velocityData.sprints.length > 0 &&
    velocityData.sprints.some(
      (s) => (s.completedPoints ?? 0) > 0 || (s.capacity ?? 0) > 0,
    );

  return (
    <>
      <div className="space-y-4">
        <PageHeaderStrip
          icon={Sparkles}
          title={t("title", { defaultValue: "Sprints" })}
          description={t("subtitle", {
            defaultValue:
              "Plan iterations and track progress across the project.",
          })}
          metrics={[
            {
              icon: Activity,
              value: counts.total,
              label: t("metrics.total", { defaultValue: "total" }),
            },
            counts.running > 0
              ? {
                  value: counts.running,
                  label: t("metrics.running", { defaultValue: "running" }),
                  tone: "running",
                }
              : false,
            counts.completed > 0
              ? {
                  value: counts.completed,
                  label: t("metrics.completed", { defaultValue: "completed" }),
                  tone: "success",
                }
              : false,
          ]}
          actions={
            canManageSprints ? (
              <Button
                size="sm"
                onClick={() => {
                  setEditSprint(null);
                  setIsSheetOpen(true);
                }}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                {t("addSprint")}
              </Button>
            ) : null
          }
        />

        {/* Velocity card */}
        {hasVelocityNumbers ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <div>
                  <CardTitle className="text-base">
                    {t("velocity.title", { defaultValue: "Sprint velocity" })}
                  </CardTitle>
                  <CardDescription>
                    {t("velocity.description", {
                      defaultValue:
                        "Completed points versus sprint capacity across finished sprints.",
                    })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SprintVelocityChart velocity={velocityData!} />
            </CardContent>
          </Card>
        ) : null}

        <Toolbar
          tabs={
            <Tabs
              value={status || "all"}
              onValueChange={(val) => setStatus(val === "all" ? undefined : (val as SprintStatus))}
            >
              <TabsList>
                <TabsTrigger value="all">{t("statusTabs.all")}</TabsTrigger>
                <TabsTrigger value="Pending">{t("statusTabs.pending")}</TabsTrigger>
                <TabsTrigger value="Running">{t("statusTabs.running")}</TabsTrigger>
                <TabsTrigger value="Completed">{t("statusTabs.completed")}</TabsTrigger>
                <TabsTrigger value="Stopped">{t("statusTabs.stopped")}</TabsTrigger>
              </TabsList>
            </Tabs>
          }
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("searchPlaceholder")}
          filterContent={<FilterMenu categories={filterCategories} />}
          activeFilterCount={
            (status ? 1 : 0) + 
            (sortBy ? 1 : 0) + 
            (language ? 1 : 0) + 
            (hasCapacity !== undefined ? 1 : 0) + 
            (duration ? 1 : 0)
          }
          activeFilters={activeFilterChips}
          onClearAllFilters={
            hasActiveFilters ? clearAllFilters : undefined
          }
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {sprintsAreLoading ? (
          <CardGridSkeleton count={6} />
        ) : sprints.length === 0 ? (
          search ? (
            <EmptyState
              icon={Search}
              message="No sprints match your search"
              description={`Nothing matches "${search}". Try clearing your search or creating a new sprint.`}
              action={
                <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Calendar}
              message="No sprints yet"
              description="Plan and execute your work cycles. Create your first sprint to get started."
              action={
                canManageSprints && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditSprint(null);
                      setIsSheetOpen(true);
                    }}
                    className="gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    Create sprint
                  </Button>
                )
              }
            />
          )
        ) : (
          <div className="flex flex-col gap-4">
            {viewMode === "list" && (
              <div className="grid grid-cols-[1.5rem_1fr_200px_130px_80px] gap-6 px-4 mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
                <div />
                <div>Sprint Name</div>
                <div className="hidden md:block pl-4 border-l border-border/40">Timeline</div>
                <div className="shrink-0">Progress</div>
                <div className="ml-auto">Actions</div>
              </div>
            )}
            <div className={cn(
              viewMode === "grid" 
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "flex flex-col gap-3"
            )}>
              {sprints.map((sprint) => (
                <SprintCard
                  key={sprint.id}
                  sprint={sprint}
                  viewMode={viewMode === "list" ? "list" : "grid"}
                  onOpen={setSelectedSprint}
                  onEdit={
                    canManageSprints
                      ? (s) => {
                          setEditSprint(s);
                          setIsSheetOpen(true);
                        }
                      : undefined
                  }
                  onDelete={canManageSprints ? setSprintToDelete : undefined}
                  onStatusChange={canManageSprints ? handleStatusChange : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <SprintUploadSheet
        projectId={project.id}
        projectStartDate={project.startTime}
        projectEndDate={project.endTime}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditSprint(null);
        }}
        sprint={editSprint}
      />
      <SprintDetailSheet
        projectId={project.id}
        sprint={selectedSprint}
        open={!!selectedSprint}
        onOpenChange={(open) => !open && setSelectedSprint(null)}
      />

      <ConfirmDialog
        open={!!sprintToDelete}
        onOpenChange={(open) => !open && setSprintToDelete(null)}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description")}
        onConfirm={handleDelete}
        onCancel={() => setSprintToDelete(null)}
        confirmLabel={t("deleteDialog.confirm")}
        cancelLabel={t("deleteDialog.cancel")}
      />
    </>
  );
}
