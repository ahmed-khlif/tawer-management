"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarRange,
  Flag,
  GitBranch,
  Layers3,
  ListTodo,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { GanttRow } from "@/modules/projects/types/gantt";
import type {
  GanttChart,
  GanttEpic,
  GanttMilestone,
  GanttSprint,
  GanttTask,
} from "@/modules/projects/types/project-milestones";

interface GanttItemDetailsSheetProps {
  open: boolean;
  row: GanttRow | null;
  data: GanttChart;
  onOpenChange: (open: boolean) => void;
  onOpenFullView: (row: GanttRow) => void;
}

function formatDetailDate(value: Date | string | null | undefined) {
  if (!value) return "Not scheduled";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return format(date, "MMM d, yyyy");
}

function getStatusBadgeClass(row: GanttRow) {
  switch (row.statusCategory) {
    case "done":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300";
    case "in_progress":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-300";
    case "review":
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/30 dark:text-violet-300";
    case "cancelled":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300";
    case "todo":
    default:
      return "border-muted-foreground/20 bg-muted/40 text-foreground/80";
  }
}

function getTypeBadgeClass(type: GanttRow["type"]) {
  switch (type) {
    case "sprint":
      return "border-primary/20 bg-primary/10 text-primary";
    case "epic":
      return "border-[var(--pm-project-running-accent)]/20 bg-[color:var(--pm-project-running-accent)]/10 text-[color:var(--pm-project-running-accent)]";
    case "milestone":
      return "border-primary/25 bg-primary/10 text-primary";
    case "task":
    default:
      return "border-border/70 bg-background text-muted-foreground";
  }
}

function getOpenLabel(row: GanttRow) {
  switch (row.type) {
    case "task":
      return "Open task board";
    case "sprint":
      return "Open sprint details";
    case "epic":
      return "Open epic details";
    case "milestone":
      return "Open milestone details";
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-3 py-3">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="size-3.5" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function GanttItemDetailsSheet({
  open,
  row,
  data,
  onOpenChange,
  onOpenFullView,
}: GanttItemDetailsSheetProps) {
  const details = useMemo(() => {
    if (!row) return null;

    const sprintMap = new Map(data.sprints.map((item) => [item.id, item]));
    const epicMap = new Map(data.epics.map((item) => [item.id, item]));
    const taskMap = new Map(data.tasks.map((item) => [item.id, item]));
    const milestoneMap = new Map(data.milestones.map((item) => [item.id, item]));

    const base = {
      title: row.label,
      typeLabel: row.itemTypeLabel ?? row.type,
      description: null as string | null,
      infoRows: [] as Array<{ label: string; value: string }>,
      stats: [] as Array<{ label: string; value: string; icon: React.ComponentType<{ className?: string }> }>,
    };

    if (row.type === "task") {
      const task = taskMap.get(row.originalId) as GanttTask | undefined;
      const epic = task?.epicId ? epicMap.get(task.epicId) : undefined;
      const sprint =
        (task?.sprintId ? sprintMap.get(task.sprintId) : undefined) ??
        (epic?.sprintId ? sprintMap.get(epic.sprintId) : undefined);

      return {
        ...base,
        description: null,
        infoRows: [
          { label: "Task key", value: task?.key ?? row.keyLabel ?? "N/A" },
          { label: "Task type", value: task?.type ?? row.itemTypeLabel ?? "Task" },
          { label: "Priority", value: task?.priority ?? "Not set" },
          { label: "Epic", value: epic?.name ?? "No epic" },
          { label: "Sprint", value: sprint?.name ?? "No sprint" },
        ],
        stats: [
          { label: "Start date", value: formatDetailDate(row.startDate), icon: CalendarRange },
          { label: "Due date", value: formatDetailDate(row.endDate), icon: Target },
          { label: "Progress", value: `${Math.round(row.progress)}%`, icon: Flag },
          { label: "Dependencies", value: String(row.dependencyCount ?? 0), icon: GitBranch },
        ],
      };
    }

    if (row.type === "epic") {
      const epic = epicMap.get(row.originalId) as GanttEpic | undefined;
      const sprint = epic?.sprintId ? sprintMap.get(epic.sprintId) : undefined;
      const taskCount = data.tasks.filter((task) => task.epicId === epic?.id).length;

      return {
        ...base,
        description: epic?.description ?? null,
        infoRows: [
          { label: "Sprint", value: sprint?.name ?? "Standalone epic" },
          { label: "Child tasks", value: String(taskCount) },
        ],
        stats: [
          { label: "Start date", value: formatDetailDate(row.startDate), icon: CalendarRange },
          { label: "End date", value: formatDetailDate(row.endDate), icon: Target },
          { label: "Progress", value: `${Math.round(row.progress)}%`, icon: Flag },
          { label: "Task coverage", value: `${taskCount} linked`, icon: Layers3 },
        ],
      };
    }

    if (row.type === "sprint") {
      const sprint = sprintMap.get(row.originalId) as GanttSprint | undefined;
      const epicCount = data.epics.filter((epic) => epic.sprintId === sprint?.id).length;
      const taskCount = data.tasks.filter((task) => task.sprintId === sprint?.id).length;

      return {
        ...base,
        description: null,
        infoRows: [
          { label: "Sprint status", value: sprint?.status ?? row.statusLabel },
          { label: "Epics in sprint", value: String(epicCount) },
          { label: "Tasks in sprint", value: String(taskCount) },
        ],
        stats: [
          { label: "Start date", value: formatDetailDate(row.startDate), icon: CalendarRange },
          { label: "End date", value: formatDetailDate(row.endDate), icon: Target },
          { label: "Progress", value: `${Math.round(row.progress)}%`, icon: Flag },
          { label: "Delivery items", value: `${taskCount + epicCount}`, icon: ListTodo },
        ],
      };
    }

    const milestone = milestoneMap.get(row.originalId) as GanttMilestone | undefined;

    return {
      ...base,
      description: milestone?.description ?? null,
      infoRows: [
        { label: "Milestone status", value: milestone?.status ?? row.statusLabel },
        { label: "Completed at", value: formatDetailDate(milestone?.completedAt) },
      ],
      stats: [
        { label: "Due date", value: formatDetailDate(milestone?.dueDate ?? row.startDate), icon: CalendarRange },
        { label: "Progress", value: `${Math.round(row.progress)}%`, icon: Flag },
        { label: "Child items", value: String(row.childTaskCount ?? 0), icon: ListTodo },
        { label: "Dependencies", value: String(row.dependencyCount ?? 0), icon: GitBranch },
      ],
    };
  }, [data, row]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        {row && details ? (
          <>
            <SheetHeader className="border-b border-border/60 pb-5">
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <Badge variant="outline" className={cn("capitalize", getTypeBadgeClass(row.type))}>
                  {details.typeLabel}
                </Badge>
                <Badge variant="outline" className={getStatusBadgeClass(row)}>
                  {row.statusLabel}
                </Badge>
                {row.keyLabel ? (
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 font-mono text-primary">
                    {row.keyLabel}
                  </Badge>
                ) : null}
              </div>
              <SheetTitle className="text-xl">{details.title}</SheetTitle>
              <SheetDescription className="text-sm leading-6">
                {details.description?.trim()
                  ? details.description
                  : "Focused roadmap context for this item. Use the dedicated view when you need the full workflow details."}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                {details.stats.map((stat) => (
                  <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Context</h3>
                  <p className="text-sm text-muted-foreground">
                    Core roadmap attributes linked to this timeline item.
                  </p>
                </div>
                <div className="space-y-2">
                  {details.infoRows.map((item) => (
                    <InfoRow key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/15 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Need the full workflow?</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Open the dedicated screen to edit, manage, or inspect this item in its native view.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => onOpenFullView(row)}
                    className="shrink-0"
                  >
                    {getOpenLabel(row)}
                    <ArrowRight className="ml-1 size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
