"use client";
import { dateToString } from "@/utils/date";
import DOMPurify from "dompurify";
import {
  Calendar,
  CalendarRange,
  Edit3,
  Trash2,
  Play,
  Square,
  CheckCheck,
  RotateCcw,
  ListChecks,
  Paperclip,
  Target,
  TimerReset,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SprintType,
  SprintStatus,
} from "@/modules/projects/types/project-sprints";
import { sprintStatusClasses } from "@/modules/projects/utils/badges/sprint-badges";

interface Props {
  sprint: SprintType;
  viewMode?: "grid" | "list";
  onOpen?: (sprint: SprintType) => void;
  onEdit?: (sprint: SprintType) => void;
  onDelete?: (sprint: SprintType) => void;
  onStatusChange?: (sprint: SprintType, status: SprintStatus) => void;
}

const COMPLETED_TASK_STATUSES = new Set(["DONE", "COMPLETED"]);

function toPlainTextDescription(value?: string | null) {
  if (!value) return "No description provided.";
  const sanitized = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  const normalized = sanitized.replace(/\s+/g, " ").trim();
  return normalized || "No description provided.";
}

export default function SprintCard({
  sprint,
  viewMode = "grid",
  onOpen,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) {
  const t = useTranslations("modules.projects.sprints");
  const statusClasses =
    sprintStatusClasses[sprint.status] || sprintStatusClasses["Pending"];
  const startText = dateToString(sprint.startDate);
  const endText = dateToString(sprint.endDate);
  const statusLabel = t(`status.${sprint.status.toLowerCase()}`);
  const plainDescription = toPlainTextDescription(sprint.description);

  const totalTasks = sprint.tasks?.length ?? 0;
  const completedTasks =
    sprint.tasks?.filter((task) =>
      COMPLETED_TASK_STATUSES.has(task.status?.toUpperCase?.() ?? ""),
    ).length ?? 0;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const attachmentsCount = sprint.attachments?.length ?? 0;
  const capacityValue =
    typeof sprint.capacity === "number" && Number.isFinite(sprint.capacity)
      ? sprint.capacity
      : null;

  const renderStatusAction = () => {
    if (!onStatusChange) return null;

    if (sprint.status === "Pending") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 border bg-background/95 pm-text-sprint-running shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(sprint, "Running");
              }}
            >
              <Play className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {t("tooltips.start", { defaultValue: "Start Sprint" })}
          </TooltipContent>
        </Tooltip>
      );
    }

    if (sprint.status === "Running") {
      return (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 border bg-background/95 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(sprint, "Stopped");
                }}
              >
                <Square className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {t("tooltips.stop", { defaultValue: "Stop Sprint" })}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 border bg-background/95 pm-text-sprint-completed shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(sprint, "Completed");
                }}
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {t("tooltips.complete", { defaultValue: "Complete Sprint" })}
            </TooltipContent>
          </Tooltip>
        </>
      );
    }

    if (sprint.status === "Stopped" || sprint.status === "Completed") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 border bg-background/95 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(sprint, "Running");
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {t("tooltips.restart", { defaultValue: "Restart Sprint" })}
          </TooltipContent>
        </Tooltip>
      );
    }

    return null;
  };

  const actionButtons = (
    <>
      {renderStatusAction()}
      {onEdit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 border bg-background/95 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(sprint);
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{t("tooltips.edit")}</TooltipContent>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 border bg-background/95 shadow-sm hover:bg-destructive hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(sprint);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{t("tooltips.delete")}</TooltipContent>
        </Tooltip>
      )}
    </>
  );

  if (viewMode === "grid") {
    return (
      <Card
        className={cn(
          "group relative flex h-full cursor-pointer flex-col overflow-hidden border-border/60 bg-card/95 transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg",
          sprint.status === "Completed" && "bg-emerald-500/[0.02]"
        )}
        onClick={() => onOpen?.(sprint)}
      >
        <div className="h-1 w-full bg-primary/20" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent" />
        
        <CardContent className="space-y-4 pt-4 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                {sprint.name}
              </h3>
              <p className="line-clamp-2 text-xs text-muted-foreground/80 leading-relaxed">
                {plainDescription}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "h-5 text-[10px] uppercase font-bold tracking-wider px-2",
                statusClasses
              )}
            >
              {statusLabel}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              {capacityValue !== null ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
                  <Target className="size-3.5" />
                  {capacityValue} pts capacity
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
                <TimerReset className="size-3.5" />
                {totalTasks} task{totalTasks === 1 ? "" : "s"}
              </span>
              {attachmentsCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
                  <Paperclip className="size-3.5" />
                  {attachmentsCount} file{attachmentsCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarRange className="size-3.5" />
                <span>{startText} – {endText}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ListChecks className="size-3.5" />
                <span>
                  {completedTasks}/{totalTasks}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <Progress 
                value={progressPercent} 
                className={cn("h-1.5", sprint.status === "Completed" && "bg-emerald-500/20")}
              />
              <div className="flex justify-end">
                <span className="text-[10px] font-bold text-muted-foreground">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/55">
              Sprint health
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {actionButtons}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group relative cursor-pointer border-border/60 bg-card/95 transition-all duration-200 hover:border-primary/20 hover:shadow-md",
        sprint.status === "Completed" && "bg-muted/30"
      )}
      onClick={() => onOpen?.(sprint)}
    >
      <CardContent className="flex items-center gap-6 py-3 px-4">
        {/* Status indicator strip */}
        <div 
          className={cn(
            "w-1.5 h-10 rounded-full shrink-0",
            sprint.status === "Completed" ? "bg-emerald-500" : 
            sprint.status === "Running" ? "bg-primary" : "bg-muted-foreground/20"
          )}
        />

        {/* Content */}
        <div className="flex grow flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold leading-none truncate group-hover:text-primary transition-colors">
              {sprint.name}
            </h3>
            <Badge variant="outline" className={cn("h-4 text-[9px] uppercase px-1.5 font-bold", statusClasses)}>
              {statusLabel}
            </Badge>
          </div>
          <p className="line-clamp-1 text-[11px] text-muted-foreground/70">
            {plainDescription}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-muted-foreground">
            {capacityValue !== null ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-0.5">
                <Target className="size-3" />
                {capacityValue} pts
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-0.5">
              <TimerReset className="size-3" />
              {totalTasks} task{totalTasks === 1 ? "" : "s"}
            </span>
            {attachmentsCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-0.5">
                <Paperclip className="size-3" />
                {attachmentsCount}
              </span>
            ) : null}
          </div>
        </div>

        {/* Metadata Columns */}
        <div className="hidden md:flex items-center gap-8 px-4 border-l border-r border-border/40 h-8">
          <div className="flex flex-col gap-0.5 min-w-[140px]">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
              Timeline
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <CalendarRange className="size-3.5 text-muted-foreground" />
              <span>{startText} – {endText}</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 min-w-[80px]">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
              Tasks
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <ListChecks className="size-3.5 text-muted-foreground" />
              <span>{completedTasks}/{totalTasks}</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-1.5 w-32 shrink-0">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            <span>Progress</span>
            <span className="text-foreground">{progressPercent}%</span>
          </div>
          <Progress 
            value={progressPercent} 
            className={cn(
              "h-1.5",
              sprint.status === "Completed" ? "bg-emerald-500/20" : ""
            )} 
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <div className="flex items-center gap-1 opacity-0 transition-all duration-200 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
            {actionButtons}
          </div>
          <div className="size-8 flex items-center justify-center group-hover:hidden transition-all">
            {sprint.status === "Completed" ? (
              <CheckCheck className="size-4 text-emerald-500" />
            ) : sprint.status === "Running" ? (
              <Play className="size-4 text-primary animate-pulse" />
            ) : (
              <Calendar className="size-4 text-muted-foreground/30" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
