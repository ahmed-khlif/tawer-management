"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Activity, CalendarRange, RotateCcw, User } from "lucide-react";

import CalendarDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import {
  FilterMenu,
  type FilterMenuCategory,
} from "@/modules/projects/components/shared/filter-menu";

export interface GanttFilters {
  sprintId?: string;
  assigneeId?: string;
  statuses: string[];
  dateFrom?: string;
  dateTo?: string;
}

interface GanttFilterSheetProps {
  filters: GanttFilters;
  sprintOptions: Array<{ id: string; label: string }>;
  assigneeOptions: Array<{ id: string; label: string }>;
  statusOptions: Array<{ id: string; label: string }>;
  onChange: (filters: GanttFilters) => void;
  onClear: () => void;
}

export default function GanttFilterSheet({
  filters,
  sprintOptions,
  assigneeOptions,
  statusOptions,
  onChange,
  onClear,
}: GanttFilterSheetProps) {
  const activeCount = useMemo(
    () =>
      filters.statuses.length +
      (filters.sprintId ? 1 : 0) +
      (filters.assigneeId ? 1 : 0) +
      (filters.dateFrom || filters.dateTo ? 1 : 0),
    [filters],
  );

  const selectedDateRange = useMemo<DateRange | undefined>(() => {
    if (!filters.dateFrom && !filters.dateTo) return undefined;

    return {
      from: filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : undefined,
      to: filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`) : undefined,
    };
  }, [filters.dateFrom, filters.dateTo]);

  const categories = useMemo<FilterMenuCategory[]>(
    () => [
      {
        id: "sprint",
        label: "Sprint",
        icon: CalendarRange,
        selectedIds: filters.sprintId ? [filters.sprintId] : [],
        onClear: () => onChange({ ...filters, sprintId: undefined }),
        onToggle: (id) =>
          onChange({
            ...filters,
            sprintId: filters.sprintId === id ? undefined : id,
          }),
        options: sprintOptions,
      },
      {
        id: "status",
        label: "Status",
        icon: Activity,
        multiple: true,
        selectedIds: filters.statuses,
        onClear: () => onChange({ ...filters, statuses: [] }),
        onToggle: (id) =>
          onChange({
            ...filters,
            statuses: filters.statuses.includes(id)
              ? filters.statuses.filter((status) => status !== id)
              : [...filters.statuses, id],
          }),
        options: statusOptions,
      },
      {
        id: "assignee",
        label: "Assigned",
        icon: User,
        selectedIds: filters.assigneeId ? [filters.assigneeId] : [],
        onClear: () => onChange({ ...filters, assigneeId: undefined }),
        onToggle: (id) =>
          onChange({
            ...filters,
            assigneeId: filters.assigneeId === id ? undefined : id,
          }),
        options: assigneeOptions,
      },
    ],
    [assigneeOptions, filters, onChange, sprintOptions, statusOptions],
  );

  return (
    <FilterMenu
      categories={categories}
      footer={
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Date Range
            </p>
            <CalendarDateRangePicker
              value={selectedDateRange}
              onRangeChange={(range) =>
                onChange({
                  ...filters,
                  dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
                  dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
                })
              }
              className="w-full"
              placeholder="Filter by date range"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {activeCount > 0 ? `${activeCount} active filter${activeCount > 1 ? "s" : ""}` : "No active filters"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs"
              onClick={onClear}
            >
              <RotateCcw className="size-3.5" />
              Clear all
            </Button>
          </div>
        </div>
      }
    />
  );
}
