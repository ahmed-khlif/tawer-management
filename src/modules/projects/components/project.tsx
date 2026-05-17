"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Edit3,
  Trash2,
  Archive,
  ArchiveRestore,
  Play,
  Square,
  CheckCheck,
  Star,
  Users,
  MoreHorizontal,
  TimerReset,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, isAfter, isBefore } from "date-fns";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useMemo } from "react";
import { ProjectType } from "../types/projects";
import {
  projectStatusClasses,
  projectTypeClasses,
  businessUnitClasses,
  businessUnitNamed,
  businessUnitFallbackClasses,
} from "../utils/badges/project-badges";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";

interface Props {
  project: ProjectType;
  viewMode?: "grid" | "list";
  isDraggingOverlay?: boolean;
  isSelected?: boolean;
  selectionActive?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (project: ProjectType) => void;
  onDelete?: (project: ProjectType) => void;
  onArchive?: (project: ProjectType) => void;
  onStatusChange?: (
    project: ProjectType,
    status: "Running" | "Stopped" | "Completed",
  ) => void;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  trackClass?: string;
  fillClass?: string;
}

function CircularProgress({
  value,
  size = 36,
  strokeWidth = 3,
  className,
  label,
  trackClass = "stroke-current pm-progress-ring-track",
  fillClass = "stroke-current pm-progress-ring-mid",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-label={label ?? `${Math.round(clamped)}%`}
      role="img"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={cn(fillClass, "transition-[stroke-dashoffset] duration-300")}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold tabular-nums">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

export default function ProjectContainer({
  project,
  viewMode = "grid",
  isDraggingOverlay = false,
  isSelected = false,
  selectionActive = false,
  onSelect,
  onEdit,
  onDelete,
  onArchive,
  onStatusChange,
}: Props) {
  const t = useTranslations("modules.projects.project");
  const router = useRouter();
  const { user } = useCurrentUser();
  const canEdit =
    !!user && hasPermissions(user.roles, "projectsManagement", "edit");
  const canDelete =
    !!user && hasPermissions(user.roles, "projectsManagement", "delete");

  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? (!isDraggingOverlay ? 0.4 : 0.8) : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const isCompleted = project.status === "Completed";
  const isSelectionMode = selectionActive;

  const statusColors =
    projectStatusClasses[project.status] || projectStatusClasses["Pending"];
  const typeColors =
    projectTypeClasses[project.projectType] || projectTypeClasses["AGILE"];
  const buColors = project.businessUnit
    ? businessUnitClasses[project.businessUnit] ?? businessUnitFallbackClasses
    : "";
  const buLabel = project.businessUnit
    ? businessUnitNamed[project.businessUnit] ?? project.businessUnit
    : "";

  // Precision Utilitarian: subdued gray for pending, surgical indigo for
  // running, clean emerald for completed, destructive red for stopped.
  const statusAccentClass = (
    {
      Pending: "pm-accent-project-pending",
      Running: "pm-accent-project-running",
      Completed: "pm-accent-project-completed",
      Stopped: "pm-accent-project-stopped",
    } as Record<string, string>
  )[project.status] ?? "pm-accent-project-pending";

  const buDotClass =
    project.businessUnit === "TawerDev"
      ? "pm-dot-bu-dev"
      : project.businessUnit === "TawerCreative"
        ? "pm-dot-bu-creative"
        : "bg-muted-foreground/50";

  const startDate = project.startTime ? new Date(project.startTime) : null;
  const endDate = project.endTime ? new Date(project.endTime) : null;
  const startDateText = startDate ? format(startDate, "MMM d, yyyy") : "";
  const endDateText = endDate ? format(endDate, "MMM d, yyyy") : "";
  const dateTooltipText = endDate
    ? t("details.endDate", {
        date: format(endDate, "MMM d, yyyy - h:mm a"),
      })
    : "";

  const statusLabel =
    project.status === "Running"
      ? t("status.running")
      : project.status === "Completed"
        ? t("status.completed")
        : project.status === "Stopped"
          ? t("status.stopped", { defaultValue: "Stopped" })
          : t("status.pending");
  const typeLabel =
    project.projectType === "AGILE"
      ? t("projectType.agile")
      : project.projectType === "FREESTYLE"
        ? t("projectType.freestyle")
        : project.projectType || "AGILE";

  // ── Time-based progress (how far along the project timeline are we) ─────────
  const progress = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const now = new Date();
    if (isCompleted) return 100;
    if (isBefore(now, startDate)) return 0;
    if (isAfter(now, endDate)) return 100;
    const total = differenceInDays(endDate, startDate);
    const elapsed = differenceInDays(now, startDate);
    if (total <= 0) return 100;
    return Math.round((elapsed / total) * 100);
  }, [startDate, endDate, isCompleted]);

  const isOverdue =
    !!endDate && !isCompleted && isAfter(new Date(), endDate);

  // Sleek indigo progression that turns solid emerald only when the project
  // is fully complete, and destructive red only when overdue. No mid-range
  // yellows / oranges — strict "Digital Curator" palette.
  const progressFillClass = isOverdue
    ? "stroke-current pm-progress-ring-overdue"
    : isCompleted
      ? "stroke-current pm-progress-ring-complete"
      : progress >= 80
        ? "stroke-current pm-progress-ring-late"
        : progress >= 40
          ? "stroke-current pm-progress-ring-mid"
          : "stroke-current pm-progress-ring-early";

  const visibleMembers = (project.members ?? []).slice(0, 3);
  const remainingMembers =
    (project.memberCount ?? project.members?.length ?? 0) - visibleMembers.length;
  const totalMembers =
    project.memberCount ?? project.members?.length ?? 0;
  const durationDays =
    startDate && endDate ? Math.max(differenceInDays(endDate, startDate), 0) + 1 : null;
  const managerCount =
    project.members?.filter((member) => member.isManager).length ?? 0;

  // Navigation distinguishes click from drag
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!pointerDownPos.current) return;
    const dx = Math.abs(e.clientX - pointerDownPos.current.x);
    const dy = Math.abs(e.clientY - pointerDownPos.current.y);
    if (dx < 5 && dy < 5) {
      if (isSelectionMode) {
        onSelect?.(project.id);
      } else {
        router.push(`/dashboard/projects/${project.id}`);
      }
    }
    pointerDownPos.current = null;
  };

  const hasAnyAction =
    !!(canEdit || canDelete) &&
    !!(
      onEdit ||
      onArchive ||
      onDelete ||
      (onStatusChange &&
        (project.status === "Pending" || project.status === "Running"))
    );

  const actionsMenu = hasAnyAction ? (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-md bg-background/80 backdrop-blur border shadow-sm hover:bg-background"
                data-no-dnd
                aria-label={t("tooltips.more", {
                  defaultValue: "More actions",
                })}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            {t("tooltips.more", { defaultValue: "More actions" })}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent
        align="end"
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {t("actions.label", { defaultValue: "Actions" })}
        </DropdownMenuLabel>

        {canEdit && onStatusChange && project.status === "Pending" ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange?.(project, "Running");
            }}
          >
            <Play className="size-4 mr-2 pm-text-project-running" />
            {t("tooltips.start", { defaultValue: "Start Project" })}
          </DropdownMenuItem>
        ) : null}

        {canEdit && onStatusChange && project.status === "Running" ? (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange?.(project, "Stopped");
              }}
            >
              <Square className="size-4 mr-2" />
              {t("tooltips.stop", { defaultValue: "Stop Project" })}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange?.(project, "Completed");
              }}
            >
              <CheckCheck className="size-4 mr-2 pm-text-project-completed" />
              {t("tooltips.complete", {
                defaultValue: "Mark as Completed",
              })}
            </DropdownMenuItem>
          </>
        ) : null}

        {canEdit && onEdit ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(project);
            }}
          >
            <Edit3 className="size-4 mr-2" />
            {t("tooltips.edit", { defaultValue: "Edit Project" })}
          </DropdownMenuItem>
        ) : null}

        {canDelete && onArchive ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onArchive?.(project);
            }}
          >
            {project.isArchived ? (
              <>
                <ArchiveRestore className="size-4 mr-2" />
                {t("tooltips.restore", { defaultValue: "Restore Project" })}
              </>
            ) : (
              <>
                <Archive className="size-4 mr-2" />
                {t("tooltips.archive", { defaultValue: "Archive Project" })}
              </>
            )}
          </DropdownMenuItem>
        ) : null}

        {canDelete && onDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(project);
              }}
            >
              <Trash2 className="size-4 mr-2" />
              {t("tooltips.delete", { defaultValue: "Delete Project" })}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  // ── Reusable building blocks ────────────────────────────────────────────────
  const memberAvatars =
    totalMembers > 0 ? (
      <TooltipProvider delayDuration={120}>
        <div className="flex items-center -space-x-2">
          {visibleMembers.map((member) => {
            const name =
              member.memberName || member.user?.name || "Member";
            return (
              <Tooltip key={member.id}>
                <TooltipTrigger asChild>
                  <Avatar className="size-7 border-2 border-card bg-muted">
                    {member.user?.image ? (
                      <AvatarImage src={member.user.image} alt={name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {getInitials(name)}
                    </AvatarFallback>
                    {member.isManager ? (
                      <AvatarIndicator
                        variant="success"
                        position="bottom-end"
                        className="size-2"
                      />
                    ) : null}
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{name}</TooltipContent>
              </Tooltip>
            );
          })}
          {remainingMembers > 0 ? (
            <span
              className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground"
              aria-label={`+${remainingMembers} more members`}
            >
              +{remainingMembers}
            </span>
          ) : null}
        </div>
      </TooltipProvider>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="size-3.5" />
        {t("details.member", { count: 0 })}
      </span>
    );

  const dateRange = startDate && endDate ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3" />
          <span className="tabular-nums">{startDateText}</span>
          <span aria-hidden="true">→</span>
          <span
            className={cn(
              "tabular-nums",
              isOverdue && "text-destructive font-medium",
            )}
          >
            {endDateText}
          </span>
        </span>
      </TooltipTrigger>
      {dateTooltipText ? <TooltipContent>{dateTooltipText}</TooltipContent> : null}
    </Tooltip>
  ) : null;

  const statusBadges = (
    <div className="flex flex-wrap items-center gap-1.5 capitalize">
      <Badge variant="outline" className={cn("font-normal", statusColors)}>
        {statusLabel}
      </Badge>
      <Badge variant="outline" className={cn("font-normal", typeColors)}>
        {typeLabel}
      </Badge>
      {project.businessUnit ? (
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className={cn("size-1.5 shrink-0 rounded-full", buDotClass)} />
          {buLabel}
        </span>
      ) : null}
    </div>
  );

  const statPills = (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
      {durationDays !== null ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
          <TimerReset className="size-3.5" />
          {durationDays}d
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
        <Users className="size-3.5" />
        {totalMembers} {totalMembers === 1 ? "member" : "members"}
      </span>
      {managerCount > 0 ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
          <Target className="size-3.5" />
          {managerCount} {managerCount === 1 ? "manager" : "managers"}
        </span>
      ) : null}
    </div>
  );

  // ── Grid view (image-2 style) ───────────────────────────────────────────────
  if (viewMode === "grid") {
    return (
      <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
        <Card
          className={cn(
            "group relative flex h-full cursor-pointer flex-col gap-3 overflow-hidden border-border/70 bg-card/95 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg",
            isSelected && "ring-2 ring-primary",
            isCompleted && "opacity-70",
            isDraggingOverlay && "rotate-1 scale-[1.02] ring-2 ring-primary shadow-xl",
          )}
          onPointerDown={handlePointerDown}
          onClick={handleClick}
        >
          {/* Three-dot actions menu — visible on hover and focus */}
          {actionsMenu ? (
            <div className="absolute right-2 top-2 z-10 opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
              {actionsMenu}
            </div>
          ) : null}

          {/* Status accent bar */}
          <div className={cn("absolute left-0 top-0 h-full w-1 rounded-l-lg", statusAccentClass)} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent" />

          <CardContent className="flex h-full flex-col justify-between gap-3 p-0 pl-2">
            {/* Header: checkbox + title + favorite */}
            <div className="flex min-w-0 items-start gap-2">
              <Checkbox
                checked={isSelectionMode ? isSelected : false}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(project.id);
                }}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <h3
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-semibold leading-snug",
                    isCompleted && "text-muted-foreground line-through",
                  )}
                  title={project.name}
                >
                  <span className="truncate">{project.name}</span>
                  {project.isFavorite ? (
                    <Star className="size-3.5 shrink-0 fill-primary text-primary" />
                  ) : null}
                </h3>
                {project.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                ) : (
                  <p className="mt-1 text-xs italic text-muted-foreground/70">
                    {t("details.noDescriptionShort", {
                      defaultValue: "No description yet",
                    })}
                  </p>
                )}
              </div>
            </div>

            {statPills}

            {/* Members + progress */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {memberAvatars}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-0.5">
                    <CircularProgress
                      value={progress}
                      size={36}
                      strokeWidth={3}
                      trackClass="stroke-current pm-progress-ring-track"
                      fillClass={progressFillClass}
                    />
                    <span className="text-[9px] leading-none tabular-nums text-muted-foreground">
                      {isOverdue ? "late" : progress >= 80 ? "soon" : "on track"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isOverdue
                    ? t("details.overdue", { defaultValue: "Overdue" })
                    : t("details.timeProgressLabel", {
                        defaultValue: "Time progress",
                      })}{" "}
                  · {Math.round(progress)}%
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Footer: badges + date range */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
              {statusBadges}
              {dateRange}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── List view — dense row aligned with grid card content ─────────────────────
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <Card
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-xl border-border/80 bg-card/95 transition-all hover:border-primary/20 hover:shadow-lg",
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          isCompleted && "opacity-70",
          isDraggingOverlay && "rotate-1 scale-[1.02] ring-2 ring-primary shadow-xl",
        )}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        {actionsMenu ? (
          <div className="absolute right-2 top-2 z-10 opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
            {actionsMenu}
          </div>
        ) : null}

        {/* Status accent bar */}
        <div className={cn("absolute left-0 top-0 h-full w-1 rounded-l-xl", statusAccentClass)} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-primary/[0.05] via-transparent to-transparent" />

        <CardContent className="p-4 sm:p-5 pl-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5 md:pr-14">
            {/* Left: selection + progress */}
            <div className="flex shrink-0 items-start gap-3 md:flex-col md:items-center md:gap-2 md:pt-0.5">
              <Checkbox
                checked={isSelectionMode ? isSelected : false}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(project.id);
                }}
                className="mt-0.5 md:mt-0"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex shrink-0 flex-col items-center gap-0.5">
                    <CircularProgress
                      value={progress}
                      size={44}
                      strokeWidth={3}
                      trackClass="stroke-current pm-progress-ring-track"
                      fillClass={progressFillClass}
                    />
                    <span className="text-[9px] leading-none tabular-nums text-muted-foreground">
                      {isOverdue ? "late" : progress >= 80 ? "soon" : "on track"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isOverdue
                    ? t("details.overdue", { defaultValue: "Overdue" })
                    : t("details.timeProgressLabel", {
                        defaultValue: "Time progress",
                      })}{" "}
                  · {Math.round(progress)}%
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Main column */}
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 space-y-1">
                  <h3
                    className={cn(
                      "flex items-center gap-1.5 text-base font-semibold leading-snug tracking-tight sm:text-sm",
                      isCompleted && "text-muted-foreground line-through",
                    )}
                    title={project.name}
                  >
                    <span className="line-clamp-2 sm:line-clamp-1">{project.name}</span>
                    {project.isFavorite ? (
                      <Star className="size-3.5 shrink-0 fill-primary text-primary" />
                    ) : null}
                  </h3>
                  {project.description ? (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:line-clamp-2">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-xs italic text-muted-foreground/70">
                      {t("details.noDescriptionShort", {
                        defaultValue: "No description",
                      })}
                    </p>
                  )}
                  {/* Mini timeline progress bar */}
                  <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-border/60">
                  <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-500",
                        isOverdue ? "bg-destructive/70" : "bg-primary/50",
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="pt-1">{statPills}</div>
                </div>
                <div className="flex shrink-0 flex-wrap justify-start gap-1.5 sm:justify-end">
                  {statusBadges}
                </div>
              </div>

              {/* Meta strip — dates + team */}
              <div className="flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                  {dateRange}
                </div>
                <div className="flex items-center justify-start sm:justify-end">
                  {memberAvatars}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
