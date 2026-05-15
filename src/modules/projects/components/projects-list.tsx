import React from "react";
import {
  Plus,
  Activity,
  Archive,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Building2,
  Layers3,
  CircleDollarSign,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSensor, useSensors, PointerSensor, KeyboardSensor, type DragStartEvent, type DragEndEvent, type DragCancelEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";

import { useProjectStore } from "@/modules/projects/store/projects";
import useProjects from "../hooks/projects/use-projects";
import useProjectActions from "../hooks/projects/use-project-actions";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import { ProjectType, ProjectStatus } from "../types/projects";
import { Toolbar, type ToolbarFilterChip } from "./shared/toolbar";
import { ConfirmDialog } from "./shared/confirm-dialog";
import { EmptyState } from "./shared/empty-state";
import { PageHeaderStrip } from "./shared/page-header-strip";
import { ProjectsBulkBar } from "./projects-bulk-bar";
import { ProjectsDndGrid } from "./projects-dnd-grid";
import { ProjectsDndList } from "./projects-dnd-list";
import ProjectStatusTabs from "./project-status-tabs";
import ProjectUploadSheet from "./project-upload-sheet";
import Error500 from "@/components/error/500";
import { CardGridSkeleton } from "./shared/skeletons";
import { FilterMenu, type FilterMenuCategory } from "./shared/filter-menu";

export default function ProjectsList() {
  const t = useTranslations("modules.projects.list");
  const paginationContent = useTranslations("shared.pagination");

  const { projects, projectsAreLoading, projectsPageLoading, projectsError, page, setPage, pagesNumber, records, currentUserId, creators, refresh, searchState, projectTypeState, businessUnitState, isArchivedState, paidState, sortByState, createdByState, statusTabCounts } = useProjects();
  const { handleStatusChange, handleArchiveProject, handleDeleteProject } = useProjectActions(refresh);
  const { user } = useCurrentUser();
  const canAdd    = !!user && hasPermissions(user.roles, "projectsManagement", "add");
  const canEdit   = !!user && hasPermissions(user.roles, "projectsManagement", "edit");
  const canDelete = !!user && hasPermissions(user.roles, "projectsManagement", "delete");

  const [search, setSearch] = searchState;
  const [projectType, setProjectType] = projectTypeState;
  const [businessUnit, setBusinessUnit] = businessUnitState;
  const [isArchived, setIsArchived] = isArchivedState;
  const [paid, setPaid] = paidState;
  const [sortBy, setSortBy] = sortByState;
  const [createdById, setCreatedById] = createdByState;

  const { viewMode, setViewMode, activeTab, setActiveTab, isAddDialogOpen, setAddDialogOpen } = useProjectStore();
  const [editProject, setEditProject] = React.useState<ProjectType | null>(null);
  const [projectToDelete, setProjectToDelete] = React.useState<ProjectType | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStatusChange = async (status: ProjectStatus) => {
    await Promise.all(Array.from(selectedIds).map(id => { const p = projects?.find(x => x.id === id); return p ? handleStatusChange(p, status) : Promise.resolve(); }));
    clearSelection();
  };
  const handleBulkArchive = async () => { await Promise.all(Array.from(selectedIds).map(id => { const p = projects?.find(x => x.id === id); return p && !p.isArchived ? handleArchiveProject(p) : Promise.resolve(); })); clearSelection(); };
  const handleBulkRestore = async () => { await Promise.all(Array.from(selectedIds).map(id => { const p = projects?.find(x => x.id === id); return p && p.isArchived ? handleArchiveProject(p) : Promise.resolve(); })); clearSelection(); };
  const handleBulkDelete = async () => { await Promise.all(Array.from(selectedIds).map(id => { const p = projects?.find(x => x.id === id); return p ? handleDeleteProject(p) : Promise.resolve(); })); clearSelection(); setIsBulkDeleteOpen(false); };
  const handleDelete = async () => { if (!projectToDelete) return; await handleDeleteProject(projectToDelete); setProjectToDelete(null); setIsDeleteOpen(false); };

  const allPageSelected = (projects?.length ?? 0) > 0 && projects?.every(p => selectedIds.has(p.id));
  const toggleSelectAll = () => {
    if (allPageSelected) { setSelectedIds(prev => { const n = new Set(prev); projects?.forEach(p => n.delete(p.id)); return n; }); }
    else { setSelectedIds(prev => { const n = new Set(prev); projects?.forEach(p => n.add(p.id)); return n; }); }
  };

  const clearFilters = () => { setSearch(""); setProjectType(undefined); setBusinessUnit(undefined); setIsArchived(undefined); setPaid(undefined); setSortBy(undefined); setCreatedById(undefined); setActiveTab("all"); };
  const activeFilterCount = (projectType ? 1 : 0) + (businessUnit ? 1 : 0) + (isArchived === true ? 1 : 0) + (paid !== undefined ? 1 : 0) + (sortBy ? 1 : 0) + (createdById ? 1 : 0);

  const sortLabelMap: Record<string, string> = {
    displayOrderAsc: t("filters.displayOrder", { defaultValue: "Display Order" }),
    startDateAsc: t("filters.startDateAscending", { defaultValue: "Start Date (Oldest)" }),
    startDateDesc: t("filters.startDateDescending", { defaultValue: "Start Date (Newest)" }),
    estimatedStartDateAsc: t("filters.estimatedStartAsc", { defaultValue: "Est. Start (Oldest)" }),
    estimatedStartDateDesc: t("filters.estimatedStartDesc", { defaultValue: "Est. Start (Newest)" }),
    estimatedEndDateAsc: t("filters.estimatedEndAsc", { defaultValue: "Est. End (Oldest)" }),
    estimatedEndDateDesc: t("filters.estimatedEndDesc", { defaultValue: "Est. End (Newest)" }),
    createdAtAsc: t("filters.createdAtAscending", { defaultValue: "Created (Oldest)" }),
    createdAtDesc: t("filters.createdAtDescending", { defaultValue: "Created (Newest)" }),
  };
  const buLabelMap: Record<string, string> = {
    TawerDev: t("filters.tawerDev", { defaultValue: "Tawer Dev" }),
    TawerCreative: t("filters.tawerCreative", { defaultValue: "Tawer Creative" }),
  };
  const typeLabelMap: Record<string, string> = {
    AGILE: t("filters.agile", { defaultValue: "Agile" }),
    FREESTYLE: t("filters.freestyle", { defaultValue: "Freestyle" }),
  };

  const activeFilterChips: ToolbarFilterChip[] = React.useMemo(() => {
    const chips: ToolbarFilterChip[] = [];
    if (projectType) {
      chips.push({
        id: "projectType",
        prefix: t("filters.projectType", { defaultValue: "Type" }) + ":",
        label: typeLabelMap[projectType] ?? projectType,
        onRemove: () => setProjectType(undefined),
      });
    }
    if (businessUnit) {
      chips.push({
        id: "businessUnit",
        prefix: t("filters.businessUnit", { defaultValue: "BU" }) + ":",
        label: buLabelMap[businessUnit] ?? businessUnit,
        onRemove: () => setBusinessUnit(undefined),
      });
    }
    if (isArchived === true) {
      chips.push({
        id: "isArchived",
        label: t("filters.archived", { defaultValue: "Archived" }),
        onRemove: () => setIsArchived(false),
      });
    }
    if (paid !== undefined) {
      chips.push({
        id: "paid",
        prefix: t("filters.paid", { defaultValue: "Paid" }) + ":",
        label: paid
          ? t("filters.paid", { defaultValue: "Paid" })
          : t("filters.free", { defaultValue: "Free" }),
        onRemove: () => setPaid(undefined),
      });
    }
    if (sortBy) {
      chips.push({
        id: "sortBy",
        prefix: t("filters.sortBy", { defaultValue: "Sort" }) + ":",
        label: sortLabelMap[sortBy] ?? sortBy,
        onRemove: () => setSortBy(undefined),
      });
    }
    if (createdById) {
      const isMe = createdById === currentUserId;
      const creatorName = isMe
        ? t("filters.createdByMe", { defaultValue: "Created by me" })
        : creators.find((c) => c.id === createdById)?.name ?? createdById;
      chips.push({
        id: "createdById",
        prefix: t("filters.createdBy", { defaultValue: "Created by" }) + ":",
        label: creatorName,
        onRemove: () => setCreatedById(undefined),
      });
    }
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectType, businessUnit, isArchived, paid, sortBy, createdById, creators, currentUserId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const onDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const onDragEnd = (e: DragEndEvent) => { setActiveId(null); };
  const onDragCancel = (e: DragCancelEvent) => setActiveId(null);

  const dndProps = { projects, sensors, activeId, selectedIds, selectionActive: selectedIds.size > 0, onSelect: toggleSelect, onEdit: canEdit ? (p: ProjectType) => { setEditProject(p); setAddDialogOpen(true); } : undefined, onDelete: canDelete ? (p: ProjectType) => { setProjectToDelete(p); setIsDeleteOpen(true); } : undefined, onArchive: canDelete ? handleArchiveProject : undefined, onStatusChange: canEdit ? handleStatusChange : undefined, onDragStart, onDragEnd, onDragCancel };

  const filterCategories: FilterMenuCategory[] = [
    {
      id: "sortBy",
      label: t("filters.sortBy", { defaultValue: "Sort By" }),
      icon: SlidersHorizontal,
      options: [
        { id: "displayOrderAsc", label: t("filters.displayOrder", { defaultValue: "Display Order" }) },
        { id: "startDateAsc", label: t("filters.startDateAscending", { defaultValue: "Start Date (Oldest)" }) },
        { id: "startDateDesc", label: t("filters.startDateDescending", { defaultValue: "Start Date (Newest)" }) },
        { id: "estimatedStartDateAsc", label: t("filters.estimatedStartAsc", { defaultValue: "Est. Start (Oldest)" }) },
        { id: "estimatedStartDateDesc", label: t("filters.estimatedStartDesc", { defaultValue: "Est. Start (Newest)" }) },
        { id: "estimatedEndDateAsc", label: t("filters.estimatedEndAsc", { defaultValue: "Est. End (Oldest)" }) },
        { id: "estimatedEndDateDesc", label: t("filters.estimatedEndDesc", { defaultValue: "Est. End (Newest)" }) },
        { id: "createdAtAsc", label: t("filters.createdAtAscending", { defaultValue: "Created (Oldest)" }) },
        { id: "createdAtDesc", label: t("filters.createdAtDescending", { defaultValue: "Created (Newest)" }) },
      ],
      selectedIds: sortBy ? [sortBy] : [],
      onToggle: (id) => setSortBy(id === sortBy ? undefined : id),
      onClear: () => setSortBy(undefined),
    },
    {
      id: "projectType",
      label: t("filters.projectType", { defaultValue: "Project Type" }),
      icon: Layers3,
      options: [
        { id: "AGILE", label: t("filters.agile", { defaultValue: "Agile" }) },
        { id: "FREESTYLE", label: t("filters.freestyle", { defaultValue: "Freestyle" }) },
      ],
      selectedIds: projectType ? [projectType] : [],
      onToggle: (id) => setProjectType(id === projectType ? undefined : (id as typeof projectType)),
      onClear: () => setProjectType(undefined),
    },
    {
      id: "businessUnit",
      label: t("filters.businessUnit", { defaultValue: "Business Unit" }),
      icon: Building2,
      options: [
        { id: "TawerDev", label: t("filters.tawerDev", { defaultValue: "Tawer Dev" }) },
        { id: "TawerCreative", label: t("filters.tawerCreative", { defaultValue: "Tawer Creative" }) },
      ],
      selectedIds: businessUnit ? [businessUnit] : [],
      onToggle: (id) => setBusinessUnit(id === businessUnit ? undefined : (id as typeof businessUnit)),
      onClear: () => setBusinessUnit(undefined),
    },
    {
      id: "isArchived",
      label: t("filters.isArchived", { defaultValue: "Archived" }),
      icon: Archive,
      options: [
        { id: "true", label: t("filters.archived", { defaultValue: "Archived" }) },
        { id: "false", label: t("filters.active", { defaultValue: "Active" }) },
      ],
      selectedIds: isArchived === undefined ? [] : [String(isArchived)],
      onToggle: (id) => {
        const next = id === "true";
        setIsArchived(isArchived === next ? undefined : next);
      },
      onClear: () => setIsArchived(undefined),
    },
    {
      id: "paid",
      label: t("filters.paid", { defaultValue: "Paid" }),
      icon: CircleDollarSign,
      options: [
        { id: "true", label: t("filters.paid", { defaultValue: "Paid" }) },
        { id: "false", label: t("filters.free", { defaultValue: "Free" }) },
      ],
      selectedIds: paid === undefined ? [] : [String(paid)],
      onToggle: (id) => {
        const next = id === "true";
        setPaid(paid === next ? undefined : next);
      },
      onClear: () => setPaid(undefined),
    },
    {
      id: "createdById",
      label: t("filters.createdBy", { defaultValue: "Created By" }),
      icon: UserRound,
      options: [
        ...(currentUserId
          ? [
              {
                id: currentUserId,
                label: t("filters.createdByMe", { defaultValue: "Created by me" }),
              },
            ]
          : []),
        ...creators
          .filter((creator) => creator.id !== currentUserId)
          .map((creator) => ({
            id: creator.id,
            label: creator.name,
          })),
      ],
      selectedIds: createdById ? [createdById] : [],
      onToggle: (id) => setCreatedById(id === createdById ? undefined : id),
      onClear: () => setCreatedById(undefined),
    },
  ];

  const filterContent = (
    <FilterMenu
      categories={filterCategories}
      textOverrides={{
        heading: t("filters.title", { defaultValue: "Filter projects" }),
        searchPlaceholder: t("filters.searchPlaceholder", { defaultValue: "Search options..." }),
        noResults: t("filters.noResults", { defaultValue: "No matching options" }),
        clear: t("filters.clear", { defaultValue: "Clear" }),
      }}
    />
  );

  const totalCount = records ?? projects?.length ?? 0;
  const archivedCount =
    projects?.filter((p) => p.isArchived).length ?? 0;
  const activeCount = totalCount - archivedCount;
  const totalPages = pagesNumber ?? 1;
  const totalRecords = records ?? projects?.length ?? 0;
  const startRecord =
    totalRecords === 0 ? 0 : (page - 1) * Math.max(projects?.length ?? 0, 1) + 1;
  const endRecord =
    totalRecords === 0 ? 0 : Math.min(startRecord + (projects?.length ?? 0) - 1, totalRecords);

  if (projectsError) return <Error500 />;

  return (
    <>
      <PageHeaderStrip
        className="mb-4"
        icon={FolderKanban}
        title={t("title", { defaultValue: "Projects" })}
        description={t("subtitle", {
          defaultValue:
            "Track every project, milestone, and sprint your teams are working on.",
        })}
        metrics={[
          {
            icon: Activity,
            value: totalCount,
            label: t("metrics.total", { defaultValue: "total" }),
          },
          activeCount > 0
            ? {
                value: activeCount,
                label: t("metrics.active", { defaultValue: "active" }),
                tone: "running",
              }
            : false,
          archivedCount > 0
            ? {
                icon: Archive,
                value: archivedCount,
                label: t("metrics.archived", { defaultValue: "archived" }),
                tone: "muted",
              }
            : false,
        ]}
        actions={
          canAdd ? (
            <Button
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              {t("addProject")}
            </Button>
          ) : null
        }
      />

      <Toolbar
        tabs={
          <ProjectStatusTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={statusTabCounts}
          />
        }
        search={search} onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        filterContent={filterContent}
        activeFilterCount={activeFilterCount}
        activeFilters={activeFilterChips}
        onClearAllFilters={activeFilterCount > 0 ? clearFilters : undefined}
        viewMode={viewMode} onViewModeChange={setViewMode}
      />

      {projectsAreLoading || projectsPageLoading ? (
        <CardGridSkeleton count={9} />
      ) : projects?.length === 0 ? (
        <EmptyState
          message={t("noProjects")}
          description={t("noProjectsHint", {
            defaultValue:
              "Kick off your first project to start tracking work, milestones and team capacity.",
          })}
          icon={FolderKanban}
          action={
            canAdd ? (
              <Button
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                className="gap-1"
              >
                <Plus className="size-3.5" />
                {t("addProject")}
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <ProjectsBulkBar
            projects={projects} selectedIds={selectedIds}
            onToggleSelectAll={toggleSelectAll} onClearSelection={clearSelection}
            onBulkStatusChange={canEdit ? handleBulkStatusChange : undefined}
            onBulkArchive={canDelete ? handleBulkArchive : undefined}
            onBulkRestore={canDelete ? handleBulkRestore : undefined}
            onBulkDelete={canDelete ? () => setIsBulkDeleteOpen(true) : undefined}
          />

          {viewMode === "grid" ? (
            <ProjectsDndGrid {...dndProps} />
          ) : (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3 shadow-inner sm:p-4">
              <ProjectsDndList {...dndProps} />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <span className="text-xs text-muted-foreground">
              {records !== undefined
                ? paginationContent("summary", {
                    start: startRecord,
                    end: endRecord,
                    total: totalRecords,
                  })
                : `Page ${page}`}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="size-3.5 mr-1" />{paginationContent("previous")}
              </Button>
              <span className="text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                {paginationContent("next")}<ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      <ProjectUploadSheet
        isOpen={isAddDialogOpen}
        onClose={() => { setAddDialogOpen(false); setEditProject(null); refresh(); }}
        project={editProject as ProjectType}
      />

      <ConfirmDialog
        open={isDeleteOpen || isBulkDeleteOpen}
        onOpenChange={(open) => { if (!open) { setIsDeleteOpen(false); setIsBulkDeleteOpen(false); setProjectToDelete(null); } }}
        title={isBulkDeleteOpen ? t("deleteDialog.bulkTitle", { count: selectedIds.size }) : t("deleteDialog.title")}
        description={isBulkDeleteOpen ? t("deleteDialog.bulkDescription") : t("deleteDialog.description")}
        onConfirm={isBulkDeleteOpen ? handleBulkDelete : handleDelete}
        onCancel={() => { setIsDeleteOpen(false); setIsBulkDeleteOpen(false); setProjectToDelete(null); }}
        confirmLabel={isBulkDeleteOpen ? t("deleteDialog.confirmBulk") : t("deleteDialog.confirm")}
        cancelLabel={t("deleteDialog.cancel")}
      />
    </>
  );
}
