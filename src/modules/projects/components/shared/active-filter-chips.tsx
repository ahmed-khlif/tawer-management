"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActiveFilterChip {
  id: string;
  label: React.ReactNode;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[];
  onClearAll?: () => void;
  className?: string;
  label?: string;
}

export function ActiveFilterChips({
  chips,
  onClearAll,
  className,
  label = "Filters:",
}: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;
  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      role="group"
      aria-label="Active filters"
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {chips.map((chip) => (
        <Badge
          key={chip.id}
          variant="secondary"
          className="h-6 gap-1 rounded-full pl-2 pr-1 text-[11px] font-normal"
        >
          <span className="truncate max-w-[14rem]">{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="ml-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Remove filter"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {onClearAll ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      ) : null}
    </div>
  );
}
