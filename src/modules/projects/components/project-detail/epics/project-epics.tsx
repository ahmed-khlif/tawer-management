"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutList, Plus, Search, X, Activity, CheckCircle2, Clock, ShieldAlert, ShieldCheck, ShieldEllipsis, SlidersHorizontal, AlertCircle, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBanner } from "@/components/error-banner";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
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
