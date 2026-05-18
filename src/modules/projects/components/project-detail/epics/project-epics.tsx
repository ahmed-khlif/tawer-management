"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutList, Plus, Search, X, Activity, CheckCircle2, Clock, ShieldAlert, ShieldCheck, ShieldEllipsis, SlidersHorizontal, AlertCircle, Layers, Sparkles, CalendarRange, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBanner } from "@/components/error-banner";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectEpics } from "@/modules/projects/hooks/epics/use-project-epics";
import useEpicUpload from "@/modules/projects/hooks/epics/use-epic-upload";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { ProjectType } from "@/modules/projects/types/projects";
import { Epic } from "@/modules/projects/types/project-epics";
import EpicCard from "./epic-card";
import EpicDetailSheet from "./epic-detail-sheet";
import EpicUploadSheet from "./epic-upload-sheet";
import { EmptyState } from "../../shared/empty-state";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import { Toolbar } from "../../shared/toolbar";
import { FilterMenu, type FilterMenuCategory } from "../../shared/filter-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useMilestoneGantt from "@/modules/projects/hooks/milestones/use-milestone-gantt";

interface ProjectEpicsProps {
  project: ProjectType;
  permissions: ProjectPermissions;
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "No date";

export default function ProjectEpics({ project, permissions }: ProjectEpicsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "gantt">("grid");
  const { data, isLoading, error, refetch } = useProjectEpics(project.id, {
    page: 1,
    limit: 50,
  });
  const { deleteEpic } = useEpicUpload(project.id);
  const selectedEpicId = searchParams.get("epicId");

  useEffect(() => {
    if (!selectedEpicId) {
      return;
    }

    const matchedEpic = (data?.data ?? []).find((epic) => epic.id === selectedEpicId);
    if (matchedEpic) {
      setSelectedEpic(matchedEpic);
    }
  }, [data?.data, selectedEpicId]);

  const closeSelectedEpic = useCallback(() => {
    setSelectedEpic(null);
    if (!selectedEpicId) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("epicId");
    router.replace(
      params.size > 0 ? `${pathname}?${params.toString()}` : pathname,
    );
  }, [pathname, router, searchParams, selectedEpicId]);

  const epics = useMemo(() => {
    let source = data?.data ?? [];

    // Search
    if (search) {
      source = source.filter((epic) =>
        `${epic.name} ${epic.description ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }

    // Status
    if (selectedStatuses.length > 0) {
      source = source.filter((e) => {
        const isDone = e.totalTasks > 0 && e.doneTasks >= e.totalTasks;
        const isInProgress = e.totalTasks > 0 && e.doneTasks < e.totalTasks;
        const isNoTasks = e.totalTasks === 0;

        if (selectedStatuses.includes("completed") && isDone) return true;
        if (selectedStatuses.includes("in-progress") && isInProgress) return true;
        if (selectedStatuses.includes("no-tasks") && isNoTasks) return true;
        return false;
      });
    }

    // Risk Level
    if (selectedRisks.length > 0) {
      source = source.filter((e) => e.aiRiskLevel && selectedRisks.includes(e.aiRiskLevel));
    }

    // Sort
    if (sortBy === "nameAsc") {
      source = [...source].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "tasksDesc") {
      source = [...source].sort((a, b) => b.totalTasks - a.totalTasks);
    } else if (sortBy === "progressDesc") {
      source = [...source].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
    }

    return source;
  }, [data?.data, search, selectedStatuses, selectedRisks, sortBy]);

  const total = data?.data?.length ?? 0;
  const completed =
    data?.data?.filter((e) => e.totalTasks > 0 && e.doneTasks >= e.totalTasks)
      .length ?? 0;
  const timelineEpics = useMemo(
    () =>
      [...(data?.data ?? [])]
        .filter((epic) => epic.startDate || epic.endDate)
        .sort((a, b) => {
          const aTime = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
          const bTime = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
          return aTime - bTime;
        })
        .slice(0, 8),
    [data?.data],
  );
  const spotlightEpic =
    epics.find((epic) => epic.aiRiskLevel === "HIGH") ??
    epics.find((epic) => epic.totalTasks > 0 && epic.doneTasks < epic.totalTasks) ??
    epics[0];

  const headerStrip = (
    <PageHeaderStrip
      icon={LayoutList}
      title="Epics"
      description="Group related stories under larger initiatives."
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
      ]}
      actions={
        <PermissionGuard allowed={permissions.canCreateEpic}>
          <Button
            size="sm"
            onClick={() => {
              setEditingEpic(null);
              setSheetOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            Create epic
          </Button>
        </PermissionGuard>
      }
    />
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-52 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <ErrorBanner
          error="Unable to load project epics."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {headerStrip}

      {epics.length > 0 ? (
        <Card className="overflow-hidden border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Epic ribbon</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  A light view of initiative timing, sprint attachment, and progress.
                </p>
              </div>
              {spotlightEpic ? (
                <Badge variant="outline" className="rounded-full text-[10px] font-semibold uppercase tracking-wide">
                  <Sparkles className="mr-1 size-3.5" />
                  {spotlightEpic.name}
                </Badge>
                ) : null}
              </div>
            </CardHeader>
          <CardContent className="space-y-4 pb-5">
            {spotlightEpic ? (
              <div
                className="rounded-[1.5rem] border border-border/60 px-5 py-4"
                style={{
                  background: spotlightEpic.color
                    ? `linear-gradient(135deg, ${spotlightEpic.color}14, transparent 62%)`
                    : "linear-gradient(135deg, hsl(var(--primary) / 0.06), transparent 62%)",
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className="size-3 rounded-full border"
                        style={{ backgroundColor: spotlightEpic.color || "var(--primary)" }}
                      />
                      {spotlightEpic.aiRiskLevel ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full text-[10px] font-semibold uppercase tracking-wide",
                            spotlightEpic.aiRiskLevel === "HIGH"
                              ? "pm-tone-destructive border"
                              : spotlightEpic.aiRiskLevel === "MEDIUM"
                                ? "pm-tone-warning border"
                                : "pm-tone-success border",
                          )}
                        >
                          {spotlightEpic.aiRiskLevel}
                        </Badge>
                      ) : null}
                      <Badge variant="outline" className="rounded-full text-[10px] font-semibold uppercase tracking-wide">
                        {spotlightEpic.sprintName || "No sprint linked"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-lg font-semibold tracking-tight">{spotlightEpic.name}</p>
                      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        {spotlightEpic.description || "This initiative anchors the current epic view with scope, timing, and progress."}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-[190px] rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{Math.round(spotlightEpic.progress)}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          spotlightEpic.aiRiskLevel === "HIGH"
                            ? "bg-destructive"
                            : spotlightEpic.aiRiskLevel === "MEDIUM"
                              ? "bg-amber-500"
                              : "bg-primary",
                        )}
                        style={{ width: `${Math.max(6, Math.round(spotlightEpic.progress))}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {spotlightEpic.doneTasks}/{spotlightEpic.totalTasks} tasks complete
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {timelineEpics.length > 0 ? (
              timelineEpics.map((epic, index) => (
                <button
                  key={epic.id}
                  type="button"
                  onClick={() => setSelectedEpic(epic)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-[1.35rem] border px-4 py-3 text-left transition hover:border-primary/30 hover:bg-muted/20",
                    spotlightEpic?.id === epic.id ? "border-primary/25 bg-primary/[0.03] shadow-sm" : "border-border/60 bg-background/60",
                  )}
                >
                  <div className="flex flex-col items-center pt-1">
                    <div
                      className="size-3 rounded-full border"
                      style={{ backgroundColor: epic.color || "var(--primary)" }}
                    />
                    {index < timelineEpics.length - 1 ? (
                      <div className="mt-1 h-10 w-px bg-border" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{epic.name}</p>
                      {epic.aiRiskLevel ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full text-[10px] font-semibold uppercase tracking-wide",
                            epic.aiRiskLevel === "HIGH"
                              ? "pm-tone-destructive border"
                              : epic.aiRiskLevel === "MEDIUM"
                                ? "pm-tone-warning border"
                                : "pm-tone-success border",
                          )}
                        >
                          {epic.aiRiskLevel}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(epic.startDate)} - {formatDate(epic.endDate)}</span>
                      <span>•</span>
                      <span>{epic.sprintName || "No sprint linked"}</span>
                      <span>•</span>
                      <span>{Math.round(epic.progress)}%</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          epic.aiRiskLevel === "HIGH"
                            ? "bg-destructive"
                            : epic.aiRiskLevel === "MEDIUM"
                              ? "bg-amber-500"
                              : "bg-primary",
                        )}
                        style={{ width: `${Math.max(6, Math.round(epic.progress))}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <EmptyState
                icon={CalendarRange}
                message="No epic timeline yet"
                description="Add epic dates to unlock a clearer sequence of initiative delivery."
              />
            )}
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
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="no-tasks">No Tasks</TabsTrigger>
            </TabsList>
          </Tabs>
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search epics"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterContent={
          <FilterMenu
            categories={[
              {
                id: "status",
                label: "Status",
                icon: Activity,
                multiple: true,
                options: [
                  { id: "in-progress", label: "In Progress", icon: Clock },
                  { id: "completed", label: "Completed", icon: CheckCircle2, iconClassName: "text-success" },
                  { id: "no-tasks", label: "No Tasks", icon: X },
                ],
                selectedIds: selectedStatuses,
                onToggle: (id) =>
                  setSelectedStatuses((prev) =>
                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
                  ),
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
                onToggle: (id) =>
                  setSelectedRisks((prev) =>
                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
                  ),
              },
              {
                id: "sort",
                label: "Sort By",
                icon: SlidersHorizontal,
                options: [
                  { id: "nameAsc", label: "Name (A-Z)" },
                  { id: "tasksDesc", label: "Task Count" },
                  { id: "progressDesc", label: "Progress" },
                ],
                selectedIds: sortBy ? [sortBy] : [],
                onToggle: (id) => setSortBy(id === sortBy ? undefined : id),
              },
            ]}
          />
        }
        activeFilterCount={selectedStatuses.length + selectedRisks.length + (sortBy ? 1 : 0)}
        activeFilters={[
          ...selectedStatuses.map((id) => ({
            id: `status-${id}`,
            prefix: "Status:",
            label: id.charAt(0).toUpperCase() + id.slice(1),
            onRemove: () => setSelectedStatuses((prev) => prev.filter((i) => i !== id)),
          })),
          ...selectedRisks.map((id) => ({
            id: `risk-${id}`,
            prefix: "Risk:",
            label: id.charAt(0).toUpperCase() + id.slice(1).toLowerCase(),
            onRemove: () => setSelectedRisks((prev) => prev.filter((i) => i !== id)),
          })),
          ...(sortBy
            ? [
                {
                  id: "sortBy",
                  prefix: "Sort:",
                  label: sortBy === "nameAsc" ? "Name" : sortBy === "tasksDesc" ? "Tasks" : "Progress",
                  onRemove: () => setSortBy(undefined),
                },
              ]
            : []),
        ]}
        onClearAllFilters={
          selectedStatuses.length + selectedRisks.length + (sortBy ? 1 : 0) > 0
            ? () => {
                setSelectedStatuses([]);
                setSelectedRisks([]);
                setSortBy(undefined);
              }
            : undefined
        }
      />

      {epics.length > 0 ? (
        <div className="flex flex-col gap-4">
          {viewMode === "list" && (
            <div className="grid grid-cols-[1.5rem_1fr_200px_130px_80px] gap-6 px-4 mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
              <div />
              <div>Epic Name</div>
              <div className="hidden md:block pl-4 border-l border-border/40">Timeline</div>
              <div className="shrink-0">Progress</div>
              <div className="ml-auto">Actions</div>
            </div>
          )}
          <div className={cn(
            viewMode === "grid" 
              ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" 
              : "flex flex-col gap-3"
          )}>
            {epics.map((epic) => (
              <EpicCard
                key={epic.id}
                epic={epic}
                viewMode={viewMode === "list" ? "list" : "grid"}
                permissions={permissions}
                onOpen={setSelectedEpic}
                onEdit={(value) => {
                  setEditingEpic(value);
                  setSheetOpen(true);
                }}
                onDelete={(value) => deleteEpic.mutate(value.id)}
              />
            ))}
          </div>
        </div>
      ) : search ? (
        <EmptyState
          icon={Search}
          message="No epics match your search"
          description={`Nothing matches "${search}". Try clearing your search or creating a new epic.`}
          action={
            <Button size="sm" variant="outline" onClick={() => setSearch("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Layers}
          message="No epics yet"
          description="Group related stories under larger initiatives to track progress at a glance."
          action={
            permissions.canCreateEpic ? (
              <Button
                size="sm"
                onClick={() => {
                  setEditingEpic(null);
                  setSheetOpen(true);
                }}
                className="gap-1.5"
              >
                <Plus className="size-3.5" />
                Create epic
              </Button>
            ) : null
          }
        />
      )}

      <EpicUploadSheet
        projectId={project.id}
        epic={editingEpic}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
      <EpicDetailSheet
        projectId={project.id}
        epic={selectedEpic}
        open={!!selectedEpic}
        onOpenChange={(open) => !open && closeSelectedEpic()}
        onEdit={permissions.canEditEpic ? (value) => {
          closeSelectedEpic();
          setEditingEpic(value);
          setSheetOpen(true);
        } : undefined}
        canCreateTask={permissions.canCreateTask}
        canCreateReminder={permissions.canCreateReminder}
        onCreateTask={(value) => {
          closeSelectedEpic();
          router.push(
            `/dashboard/projects/${project.id}?tab=board&sprintId=${value.sprintId}&newTask=1`,
          );
        }}
      />
    </div>
  );
}
