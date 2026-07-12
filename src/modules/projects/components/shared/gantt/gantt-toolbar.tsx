"use client";

import type { ReactNode } from "react";
import { CalendarDays, Expand, Filter, Minimize2, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { GanttZoom } from "@/modules/projects/types/gantt";

interface GanttToolbarProps {
  zoom: GanttZoom;
  onZoomChange: (zoom: GanttZoom) => void;
  onScrollToToday: () => void;
  summary?: {
    sprints: number;
    epics: number;
    milestones: number;
    tasks: number;
  };
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  activeFilterCount?: number;
  filterContent?: ReactNode;
  showStatusColumn?: boolean;
  showAssigneeColumn?: boolean;
  onToggleStatusColumn?: () => void;
  onToggleAssigneeColumn?: () => void;
}

const ZOOM_OPTIONS: { value: GanttZoom; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export default function GanttToolbar({
  zoom,
  onZoomChange,
  onScrollToToday,
  summary,
  isFullscreen = false,
  onToggleFullscreen,
  activeFilterCount = 0,
  filterContent,
  showStatusColumn = true,
  showAssigneeColumn = true,
  onToggleStatusColumn,
  onToggleAssigneeColumn,
}: GanttToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs font-medium"
            onClick={onScrollToToday}
            data-roadmap-ui="kibo-today-focus"
          >
            <CalendarDays className="size-3.5" />
            Today
          </Button>

          {summary ? (
            <>
              <Badge variant="outline" className="text-[10px]">
                {summary.sprints} sprints
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {summary.epics} epics
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {summary.milestones} milestones
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {summary.tasks} tasks
              </Badge>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {filterContent ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={activeFilterCount > 0 ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <Filter className="size-3.5" />
                  Filters
                  {activeFilterCount > 0 ? (
                    <span className="rounded-full bg-background/20 px-1.5 py-0.5 text-[10px] font-semibold">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto p-0">
                {filterContent}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {onToggleStatusColumn || onToggleAssigneeColumn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Settings2 className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Display</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onToggleStatusColumn ? (
                  <DropdownMenuCheckboxItem
                    checked={showStatusColumn}
                    onCheckedChange={() => onToggleStatusColumn()}
                  >
                    Status column
                  </DropdownMenuCheckboxItem>
                ) : null}
                {onToggleAssigneeColumn ? (
                  <DropdownMenuCheckboxItem
                    checked={showAssigneeColumn}
                    onCheckedChange={() => onToggleAssigneeColumn()}
                  >
                    Assigned column
                  </DropdownMenuCheckboxItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {onToggleFullscreen ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="size-3.5" />
              ) : (
                <Expand className="size-3.5" />
              )}
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </Button>
          ) : null}
          <span className="hidden text-[10px] text-muted-foreground/60 sm:inline">
            Shift + Scroll to pan
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center sm:justify-start">
        <div className="flex items-center rounded-xl border border-border bg-muted/30 p-0.5">
          {ZOOM_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onZoomChange(value)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors",
                zoom === value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
