"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  SlidersHorizontal,
  GridIcon,
  List,
  GanttChart,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface ToolbarTextOverrides {
  filtersButton?: string;
  activeFiltersHeading?: string;
  clearAll?: string;
  viewList?: string;
  viewGrid?: string;
  filterTooltip?: string;
}

export interface ToolbarFilterChip {
  /** Stable id used as React key */
  id: string;
  /** Human-friendly label, e.g. "Manager: Me" */
  label: React.ReactNode;
  /** Optional short prefix to render in muted text before the value */
  prefix?: React.ReactNode;
  /** Called when the user clicks the chip's `✕` */
  onRemove: () => void;
}

type ViewModeOption = "list" | "grid" | "gantt";
type ViewModeChangeHandler = {
  bivarianceHack(mode: any): void;
}["bivarianceHack"];

interface ToolbarProps {
  tabs?: React.ReactNode;
  /** Optional small element to render on the right of the tabs row, e.g. sort indicator */
  tabsAside?: React.ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterContent?: React.ReactNode;
  activeFilterCount?: number;
  /**
   * When provided and non-empty, a chip strip is rendered below the controls
   * row showing each active filter with a remove button.
   */
  activeFilters?: ToolbarFilterChip[];
  /** Called by the "Clear all" link rendered next to active chips */
  onClearAllFilters?: () => void;
  viewMode?: ViewModeOption;
  onViewModeChange?: ViewModeChangeHandler;
  /** Defaults to ListIcon / GridIcon */
  viewListIcon?: LucideIcon;
  viewGridIcon?: LucideIcon;
  /** Inserted after search, before Filters (e.g. “Mine only”) */
  leadingSlot?: React.ReactNode;
  /** Inserted after Filters, before view toggle (e.g. task display settings) */
  betweenFiltersAndViewSlot?: React.ReactNode;
  /** Override default `modules.projects.list` strings */
  textOverrides?: ToolbarTextOverrides;
  /** Extra classes on the filters dropdown panel */
  filterDropdownClassName?: string;
  actions?: React.ReactNode;
  /** Optional root class for consumers without horizontal padding */
  className?: string;
  /**
   * When true, the toolbar sticks to the top of its scroll container with a
   * subtle backdrop blur. Defaults to true – the legacy behaviour was static.
   */
  sticky?: boolean;
  /** Whether to show the Gantt view toggle */
  showGantt?: boolean;
}

export function Toolbar({
  tabs,
  tabsAside,
  search,
  onSearchChange,
  searchPlaceholder,
  filterContent,
  activeFilterCount = 0,
  activeFilters,
  onClearAllFilters,
  viewMode,
  onViewModeChange,
  viewListIcon = List,
  viewGridIcon = GridIcon,
  leadingSlot,
  betweenFiltersAndViewSlot,
  textOverrides,
  filterDropdownClassName,
  actions,
  className,
  sticky = true,
  showGantt = false,
}: ToolbarProps) {
  const t = useTranslations("modules.projects.list");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const tx = textOverrides ?? {};

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as HTMLElement).isContentEditable);
      if (e.key === "/" && !isEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hasChips = !!activeFilters && activeFilters.length > 0;

  return (
    <div
      className={cn(
        "flex flex-col",
        sticky &&
          "sticky top-0 z-20 -mx-4 px-4 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_60%,transparent)]",
        className,
      )}
    >
      {tabs ? (
        <div className="flex min-h-[44px] items-center justify-between gap-3 border-b border-border/40 py-1.5">
          <div className="min-w-0 overflow-x-auto">{tabs}</div>
          {tabsAside ? (
            <div className="shrink-0 text-xs text-muted-foreground">
              {tabsAside}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 py-2">
        <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 order-2 sm:order-1">
            {filterContent ? (
              <DropdownMenu modal={false}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="relative h-9 gap-1.5"
                      >
                        <SlidersHorizontal className="size-4" />
                        <span className="hidden sm:inline">
                          {tx.filtersButton ??
                            t("filtersLabel", { defaultValue: "Filters" })}
                        </span>
                        {activeFilterCount > 0 ? (
                          <Badge
                            variant="secondary"
                            className="h-4 min-w-4 rounded-full px-1 text-[10px] font-medium tabular-nums"
                          >
                            {activeFilterCount}
                          </Badge>
                        ) : null}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    {tx.filterTooltip ??
                      tx.filtersButton ??
                      t("filtersLabel", { defaultValue: "Filters" })}
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                  className={cn("w-80", filterDropdownClassName)}
                  align="start"
                >
                  {filterContent}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {leadingSlot}
            {betweenFiltersAndViewSlot}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end order-1 sm:order-2">
            <InputGroup className="w-full sm:w-72">
              <InputGroupAddon align="inline-start">
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                ref={inputRef}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label={searchPlaceholder}
              />
              <InputGroupAddon align="inline-end" className="gap-1">
                {search ? (
                  <InputGroupButton
                    size="icon-xs"
                    aria-label="Clear search"
                    onClick={() => onSearchChange("")}
                  >
                    <X className="size-3.5" />
                  </InputGroupButton>
                ) : (
                  <Kbd className="hidden md:inline-flex">/</Kbd>
                )}
              </InputGroupAddon>
            </InputGroup>

            {viewMode !== undefined && onViewModeChange ? (
              <SegmentedViewToggle
                value={viewMode}
                onChange={onViewModeChange}
                listLabel={
                  tx.viewList ?? t("viewList", { defaultValue: "List view" })
                }
                gridLabel={
                  tx.viewGrid ?? t("viewGrid", { defaultValue: "Grid view" })
                }
                ganttLabel={
                  t("viewGantt", { defaultValue: "Gantt view" })
                }
                ListIconComp={viewListIcon}
                GridIconComp={viewGridIcon}
                GanttIconComp={GanttChart}
                showGantt={showGantt}
              />
            ) : null}

            {actions}
          </div>
        </div>

        {hasChips ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {tx.activeFiltersHeading ??
                t("activeFiltersLabel", { defaultValue: "Filters" })}
            </span>
            {activeFilters!.map((chip) => (
              <FilterChipPill key={chip.id} chip={chip} />
            ))}
            {onClearAllFilters ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-6 gap-1 px-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={onClearAllFilters}
              >
                {tx.clearAll ??
                  t("clearAll", { defaultValue: "Clear all" })}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SegmentedViewToggle({
  value,
  onChange,
  listLabel,
  gridLabel,
  ganttLabel,
  ListIconComp,
  GridIconComp,
  GanttIconComp,
  showGantt = false,
}: {
  value: ViewModeOption;
  onChange: ViewModeChangeHandler;
  listLabel: string;
  gridLabel: string;
  ganttLabel: string;
  ListIconComp: LucideIcon;
  GridIconComp: LucideIcon;
  GanttIconComp: LucideIcon;
  showGantt?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="View mode"
      className="inline-flex h-9 items-center rounded-md border bg-muted/40 p-0.5"
    >
      <SegmentButton
        active={value === "list"}
        onClick={() => onChange("list")}
        ariaLabel={listLabel}
        tooltip={listLabel}
      >
        <ListIconComp className="size-4" />
      </SegmentButton>
      <SegmentButton
        active={value === "grid"}
        onClick={() => onChange("grid")}
        ariaLabel={gridLabel}
        tooltip={gridLabel}
      >
        <GridIconComp className="size-4" />
      </SegmentButton>
      {showGantt && (
        <SegmentButton
          active={value === "gantt"}
          onClick={() => onChange("gantt")}
          ariaLabel={ganttLabel}
          tooltip={ganttLabel}
        >
          <GanttIconComp className="size-4" />
        </SegmentButton>
      )}
    </div>
  );
}

function SegmentButton({
  active,
  onClick,
  ariaLabel,
  tooltip,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          aria-pressed={active}
          onClick={onClick}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-[5px] text-muted-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            active
              ? "bg-background text-foreground shadow-sm"
              : "hover:text-foreground",
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function FilterChipPill({ chip }: { chip: ToolbarFilterChip }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full border bg-muted/40 pl-2 pr-1 text-[11px] font-medium text-foreground">
      {chip.prefix ? (
        <span className="text-muted-foreground">{chip.prefix}</span>
      ) : null}
      <span className="max-w-[180px] truncate">{chip.label}</span>
      <button
        type="button"
        onClick={chip.onRemove}
        aria-label={`Remove filter ${typeof chip.label === "string" ? chip.label : ""}`}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
