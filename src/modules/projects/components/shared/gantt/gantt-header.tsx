"use client";

import { useMemo } from "react";
import { format, isSameDay, differenceInCalendarDays, addDays, isWeekend } from "date-fns";
import { cn } from "@/lib/utils";
import type { GanttViewport, GanttDateColumn } from "@/modules/projects/types/gantt";

interface GanttHeaderProps {
  viewport: GanttViewport;
}

export default function GanttHeader({ viewport }: GanttHeaderProps) {
  const columns = useMemo(() => {
    // build month columns
    const months: GanttDateColumn[] = [];
    const weeks: GanttDateColumn[] = [];
    const days: GanttDateColumn[] = [];

    const totalDays = differenceInCalendarDays(
      viewport.endDate,
      viewport.startDate,
    ) + 1;
    let curr = viewport.startDate;

    let currMonthLabel = format(curr, "MMM yyyy");
    let currMonthDays = 0;
    let currMonthStart = curr;

    let currWeekLabel = format(curr, "w");
    let currWeekDays = 0;
    let currWeekStart = curr;

    for (let i = 0; i < totalDays; i++) {
      days.push({
        label: format(curr, "dd"),
        date: curr,
        isWeekend: isWeekend(curr),
        isToday: isSameDay(curr, new Date()),
        isMonthStart: curr.getDate() === 1,
        colSpan: 1,
      });

      const next = addDays(curr, 1);
      
      const nextMonthLabel = i < totalDays - 1 ? format(next, "MMM yyyy") : "";
      if (nextMonthLabel !== currMonthLabel) {
        months.push({
          label: currMonthLabel,
          date: currMonthStart,
          isToday: false,
          isWeekend: false,
          isMonthStart: true,
          colSpan: currMonthDays + 1,
        });
        currMonthLabel = nextMonthLabel;
        currMonthDays = 0;
        currMonthStart = next;
      } else {
        currMonthDays++;
      }

      const nextWeekLabel = i < totalDays - 1 ? format(next, "w") : "";
      if (nextWeekLabel !== currWeekLabel) {
        weeks.push({
          label: `W${currWeekLabel}`,
          date: currWeekStart,
          isToday: false,
          isWeekend: false,
          isMonthStart: false,
          colSpan: currWeekDays + 1,
        });
        currWeekLabel = nextWeekLabel;
        currWeekDays = 0;
        currWeekStart = next;
      } else {
        currWeekDays++;
      }

      curr = next;
    }

    return { months, weeks, days };
  }, [viewport.startDate, viewport.endDate]);

  return (
    <div className="bg-background flex flex-col w-fit border-border/30">
      {/* Month tier */}
      <div
        className="flex border-b border-border/30"
        style={{ width: viewport.totalWidth, height: 28 }}
      >
        {columns.months.map((col) => (
          <div
            key={col.date.toISOString()}
            className="flex items-center border-r border-border/30 px-3 py-1"
              style={{ width: col.colSpan * viewport.pixelsPerDay }}
          >
            <span className="text-[10px] font-semibold text-muted-foreground">
              {col.label}
            </span>
          </div>
        ))}
      </div>

      {/* Second tier: Days or Weeks */}
      <div className="flex" style={{ width: viewport.totalWidth, height: 28 }}>
        {viewport.zoom === "month" ? (
          columns.weeks.map((col) => (
            <div
              key={col.date.toISOString()}
              className="flex items-center justify-center border-r border-border/30 py-1 relative bg-transparent"
            style={{ width: col.colSpan * viewport.pixelsPerDay }}
            >
              <span className="text-[10px] leading-none text-muted-foreground">
                {col.label}
              </span>
            </div>
          ))
        ) : (
          columns.days.map((col) => (
            <div
              key={col.date.toISOString()}
              className={cn(
                "flex items-center justify-center border-r border-border/30 py-1 relative",
                col.isWeekend ? "bg-muted/30" : "bg-transparent",
              )}
              style={{ width: viewport.pixelsPerDay }}
            >
              {viewport.pixelsPerDay >= 15 && (
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    col.isToday
                      ? "text-primary font-semibold"
                      : col.isWeekend
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground",
                  )}
                >
                  {col.label}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
