"use client";

import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GanttZoom } from "@/modules/projects/types/gantt";

interface GanttToolbarProps {
  zoom: GanttZoom;
  onZoomChange: (zoom: GanttZoom) => void;
  onScrollToToday: () => void;
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
}: GanttToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-2">
      {/* Left — scroll to today */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs font-medium"
        onClick={onScrollToToday}
      >
        <CalendarDays className="size-3.5" />
        Today
      </Button>

      {/* Center — zoom toggle */}
      <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/30">
        {ZOOM_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onZoomChange(value)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              zoom === value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right — hint */}
      <span className="hidden text-[10px] text-muted-foreground/60 sm:inline">
        Scroll down for more rows · Shift + Scroll to pan
      </span>
    </div>
  );
}
