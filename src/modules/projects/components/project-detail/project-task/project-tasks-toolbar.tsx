"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Settings2,
  SquareKanban,
  ListIcon,
  User,
  Plus,
  BarChart3,
  Tag,
  Flag,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";
import { useTranslations } from "next-intl";
import {
  EnumProjectTaskPriority,
  EnumProjectTaskType,
} from "@/modules/projects/types/project-tasks";
import {
  projectTaskPriorityDotColors,
  projectTaskTypeDotColors,
} from "../../../utils/badges/project-task-badges";
import { ProjectType } from "../../../types/projects";
import { useProjectTasksStore } from "@/modules/projects/store/project-tasks";
import {
  Toolbar,
  type ToolbarFilterChip,
  type ToolbarTextOverrides,
} from "../../shared/toolbar";
import {
  FilterMenu,
  type FilterMenuCategory,
} from "../../shared/filter-menu";

interface Props {
  project: ProjectType;
  search: string;
  setSearch: (v: string) => void;
  status: string | undefined;
  setStatus: (v: string | undefined) => void;
  priority: string | undefined;
  setPriority: (v: string | undefined) => void;
  type: string | undefined;
  setType: (v: string | undefined) => void;
  assigneeId: string | undefined;
  setAssigneeId: (v: string | undefined) => void;
  milestoneId: string | undefined;
  setMilestoneId: (v: string | undefined) => void;
  epicId: string | undefined;
  setEpicId: (v: string | undefined) => void;
  mineOnly?: boolean;
  onToggleMineOnly?: () => void;
  onAddTask?: () => void;
}

export default function ProjectTasksToolbar({
  project,
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  type,
  setType,
  assigneeId,
  setAssigneeId,
  milestoneId,
  setMilestoneId,
  epicId,
  setEpicId,
  mineOnly = false,
  onToggleMineOnly,
  onAddTask,
}: Props) {
  const tTasks = useTranslations("modules.projects.tasks");
  const { viewMode, setViewMode, visibleAttributes, toggleAttribute } =
    useProjectTasksStore();

  const activeFilterCount =
    (priority ? 1 : 0) +
    (type ? 1 : 0) +
    (assigneeId ? 1 : 0) +
    (milestoneId ? 1 : 0) +
    (epicId ? 1 : 0);

  const clearAdvancedFilters = () => {
    setPriority(undefined);
    setType(undefined);
    setAssigneeId(undefined);
    setMilestoneId(undefined);
    setEpicId(undefined);
  };

  const milestones = (project as { milestones?: { id: string; name: string }[] })
    .milestones;
  const epics = (project as { epics?: { id: string; name: string }[] }).epics;

  const assigneeLabel = React.useMemo(() => {
    if (!assigneeId) return "";
    const m = project.members?.find((mem) => mem.userId === assigneeId);
    return (
      (typeof m?.memberName === "string" && m.memberName) ||
      (typeof m?.user?.name === "string" && m.user.name) ||
      assigneeId
    );
  }, [assigneeId, project.members]);

  const activeFilterChips: ToolbarFilterChip[] = React.useMemo(() => {
    const chips: ToolbarFilterChip[] = [];
    if (priority) {
      chips.push({
        id: "priority",
        prefix: `${tTasks("filters.priority", { defaultValue: "Priority" })}:`,
        label: tTasks(`priorityLabels.${priority.toLowerCase()}`, {
          defaultValue: priority,
        }),
        onRemove: () => setPriority(undefined),
      });
    }
    if (type) {
      chips.push({
        id: "type",
        prefix: `${tTasks("filters.type", { defaultValue: "Type" })}:`,
        label: tTasks(`types.${type.toLowerCase()}`, { defaultValue: type }),
        onRemove: () => setType(undefined),
      });
    }
    if (assigneeId) {
      chips.push({
        id: "assignee",
        prefix: `${tTasks("filters.manager", { defaultValue: "Assignee" })}:`,
        label: assigneeLabel,
        onRemove: () => setAssigneeId(undefined),
      });
    }
    if (milestoneId && milestones?.length) {
      const name = milestones.find((m) => m.id === milestoneId)?.name ?? milestoneId;
      chips.push({
        id: "milestone",
        prefix: `${tTasks("filters.milestones", { defaultValue: "Milestone" })}:`,
        label: name,
        onRemove: () => setMilestoneId(undefined),
      });
    }
    if (epicId && epics?.length) {
      const name = epics.find((e) => e.id === epicId)?.name ?? epicId;
      chips.push({
        id: "epic",
        prefix: `${tTasks("filters.epics", { defaultValue: "Epic" })}:`,
        label: name,
        onRemove: () => setEpicId(undefined),
      });
    }
    return chips;
  }, [
    priority,
    type,
    assigneeId,
    milestoneId,
    epicId,
    assigneeLabel,
    milestones,
    epics,
    setPriority,
    setType,
    setAssigneeId,
    setMilestoneId,
    setEpicId,
    tTasks,
  ]);

  const memberOptions = React.useMemo(
    () =>
      (project.members ?? [])
        .filter(
          (m): m is typeof m & { userId: string } =>
            typeof m.userId === "string" && m.userId.length > 0,
        )
        .map((member) => {
          const userId = member.userId;
          const label =
            (typeof member.memberName === "string" && member.memberName) ||
            (typeof member.user?.name === "string" && member.user.name) ||
            `User ${userId.split("-").slice(-1)[0]}`;
          return { id: userId, label };
        }),
    [project.members],
  );

  const filterCategories: FilterMenuCategory[] = React.useMemo(() => {
    const cats: FilterMenuCategory[] = [
      {
        id: "type",
        label: tTasks("filters.type", { defaultValue: "Type" }),
        icon: Tag,
        multiple: false,
        selectedIds: type ? [type] : [],
        onClear: () => setType(undefined),
        onToggle: (id) => setType(type === id ? undefined : id),
        options: Object.values(EnumProjectTaskType).map((taskType) => ({
          id: taskType,
          label: tTasks(`types.${taskType.toLowerCase()}`, {
            defaultValue: taskType,
          }),
          dotColorClass: projectTaskTypeDotColors[taskType.toUpperCase()],
        })),
      },
      {
        id: "priority",
        label: tTasks("filters.priority", { defaultValue: "Priority" }),
        icon: BarChart3,
        multiple: false,
        selectedIds: priority ? [priority] : [],
        onClear: () => setPriority(undefined),
        onToggle: (id) => setPriority(priority === id ? undefined : id),
        options: Object.values(EnumProjectTaskPriority).map((p) => ({
          id: p,
          label: tTasks(`priorityLabels.${p.toLowerCase()}`, {
            defaultValue: p,
          }),
          dotColorClass: projectTaskPriorityDotColors[p.toUpperCase()],
        })),
      },
      {
        id: "assignee",
        label: tTasks("filters.manager", { defaultValue: "Manager" }),
        icon: User,
        multiple: false,
        selectedIds: assigneeId ? [assigneeId] : [],
        onClear: () => setAssigneeId(undefined),
        onToggle: (id) => setAssigneeId(assigneeId === id ? undefined : id),
        options: memberOptions,
      },
    ];

    if (milestones && milestones.length > 0) {
      cats.push({
        id: "milestone",
        label: tTasks("filters.milestones", { defaultValue: "Milestones" }),
        icon: Flag,
        multiple: false,
        selectedIds: milestoneId ? [milestoneId] : [],
        onClear: () => setMilestoneId(undefined),
        onToggle: (id) =>
          setMilestoneId(milestoneId === id ? undefined : id),
        options: milestones.map((m) => ({ id: m.id, label: m.name })),
      });
    }

    if (project.projectType === "AGILE" && epics && epics.length > 0) {
      cats.push({
        id: "epic",
        label: tTasks("filters.epics", { defaultValue: "Epics" }),
        icon: Layers,
        multiple: false,
        selectedIds: epicId ? [epicId] : [],
        onClear: () => setEpicId(undefined),
        onToggle: (id) => setEpicId(epicId === id ? undefined : id),
        options: epics.map((e) => ({ id: e.id, label: e.name })),
      });
    }

    return cats;
  }, [
    type,
    priority,
    assigneeId,
    milestoneId,
    epicId,
    memberOptions,
    milestones,
    epics,
    project.projectType,
    setType,
    setPriority,
    setAssigneeId,
    setMilestoneId,
    setEpicId,
    tTasks,
  ]);

  const filterContent = <FilterMenu categories={filterCategories} />;

  const statusKeys =
    project.projectType === "AGILE"
      ? [
          "BACKLOG",
          "TODO",
          "IN_PROGRESS",
          "TESTING",
          "IN_REVIEW",
          "DONE",
        ]
      : ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"];

  const tabsSlot = (
    <Tabs
      defaultValue={status || "all"}
      onValueChange={(val) => setStatus(val === "all" ? undefined : val)}
      value={status || "all"}
    >
      <TabsList>
        <TabsTrigger value="all">
          {tTasks("upload.form.labels.allTasks")}
        </TabsTrigger>
        {statusKeys.map((s) => (
          <TabsTrigger key={s} value={s} className="capitalize">
            {s.toLowerCase().replace("_", " ")}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );

  const textOverrides: ToolbarTextOverrides = {
    filtersButton: tTasks("filters.title", { defaultValue: "Filters" }),
    activeFiltersHeading: tTasks("filters.activeHeading", {
      defaultValue: "Filters",
    }),
    clearAll: tTasks("filters.clearFilters", { defaultValue: "Clear all" }),
    viewList: tTasks("toolbar.listView", { defaultValue: "List view" }),
    viewGrid: tTasks("toolbar.kanbanView", { defaultValue: "Kanban view" }),
    filterTooltip: tTasks("filters.title", { defaultValue: "Filters" }),
  };

  const displaySettingsSlot = (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="h-9 w-9 shrink-0">
              <Settings2 className="size-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {tTasks("displaySettings.title", {
            defaultValue: "Display Settings",
          })}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          {tTasks("displaySettings.title", {
            defaultValue: "Display Settings",
          })}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {tTasks("displaySettings.showAttributes", {
            defaultValue: "Show Attributes",
          })}
        </DropdownMenuLabel>
        {Object.entries(visibleAttributes).map(([key, value]) => {
          if (
            (key === "epic" || key === "points") &&
            project.projectType !== "AGILE"
          )
            return null;
          return (
            <DropdownMenuCheckboxItem
              key={key}
              checked={value as boolean}
              onCheckedChange={() => toggleAttribute(key as never)}
            >
              {tTasks(`displaySettings.attributes.${key}`, {
                defaultValue: key,
              })}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Toolbar
      tabs={tabsSlot}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder={tTasks("upload.form.placeholders.search")}
      filterContent={filterContent}
      activeFilterCount={activeFilterCount}
      activeFilters={activeFilterChips}
      onClearAllFilters={
        activeFilterCount > 0 ? clearAdvancedFilters : undefined
      }
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      viewListIcon={ListIcon}
      viewGridIcon={SquareKanban}
      leadingSlot={
        onToggleMineOnly ? (
          <Toggle
            aria-label={tTasks("filters.mineOnly", {
              defaultValue: "Mine only",
            })}
            title={tTasks("filters.mineOnlyTooltip", {
              defaultValue: "Only show tasks assigned to me",
            })}
            pressed={mineOnly}
            onPressedChange={onToggleMineOnly}
            variant="outline"
            className={cn(
              "h-9 gap-1.5 px-3 data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
            )}
          >
            <User className="size-4" />
            <span className="hidden text-sm font-medium sm:inline">
              {tTasks("filters.mineOnly", { defaultValue: "Mine only" })}
            </span>
          </Toggle>
        ) : null
      }
      betweenFiltersAndViewSlot={displaySettingsSlot}
      textOverrides={textOverrides}
      filterDropdownClassName="z-[150]"
      actions={
        onAddTask ? (
          <Button
            type="button"
            size="sm"
            onClick={onAddTask}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">
              {tTasks("addTask", { defaultValue: "Add task" })}
            </span>
          </Button>
        ) : null
      }
    />
  );
}
