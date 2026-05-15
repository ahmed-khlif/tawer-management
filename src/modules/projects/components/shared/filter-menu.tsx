"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Check, Search, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Linear-style nested filter menu.
 *
 * The first screen lists categories (Status, Priority, Assignee...).
 * Selecting a category drills into a search + checkable option list.
 * Multiple categories can be configured with single or multi-select
 * semantics, and each option can show an icon, dot color, or count.
 */

export interface FilterMenuOption {
  /** Stable id used as React key & selection comparison value */
  id: string;
  /** Visible label */
  label: string;
  /** Optional small leading icon (rendered to the left of the label) */
  icon?: LucideIcon;
  /** Optional className applied to the leading icon */
  iconClassName?: string;
  /** Optional Tailwind background class (e.g. "bg-yellow-500") rendered as a color dot */
  dotColorClass?: string;
  /** Optional right-aligned count (e.g. number of matching tasks) */
  count?: number;
  /** Optional override for what appears in the option row when label is not enough */
  description?: string;
}

export interface FilterMenuCategory {
  /** Stable id, e.g. "status" */
  id: string;
  /** Visible label, e.g. "Status" */
  label: string;
  /** Optional small leading icon */
  icon?: LucideIcon;
  /** Options to render inside the drill-down panel */
  options: FilterMenuOption[];
  /** Currently selected option ids (single-select uses an array of length 0 or 1) */
  selectedIds: string[];
  /** Callback when user toggles an option */
  onToggle: (optionId: string) => void;
  /** When true, multiple options can be selected at once. Defaults to false (single-select). */
  multiple?: boolean;
  /** Placeholder for the in-panel search field. Defaults to "Search …". */
  searchPlaceholder?: string;
  /** Optional callback used by the "Clear" link inside the drill-down */
  onClear?: () => void;
}

export interface FilterMenuTextOverrides {
  /** Heading at the very top of the categories screen. Defaults to "Filter". */
  heading?: string;
  /** Placeholder shown by the in-panel search input when no override is set. */
  searchPlaceholder?: string;
  /** Tooltip / aria label on the back button in drill-down view. */
  back?: string;
  /** Label shown when a drill-down has no matching options. */
  noResults?: string;
  /** Label of the "Clear" link in a drill-down with selections. */
  clear?: string;
}

interface FilterMenuProps {
  categories: FilterMenuCategory[];
  textOverrides?: FilterMenuTextOverrides;
  /** Optional footer rendered below the categories list (root view only). */
  footer?: React.ReactNode;
  /** Optional className applied to the panel root. */
  className?: string;
}

export function FilterMenu({
  categories,
  textOverrides,
  footer,
  className,
}: FilterMenuProps) {
  const tx = textOverrides ?? {};
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const active = activeId
    ? categories.find((c) => c.id === activeId) ?? null
    : null;

  return (
    <div
      className={cn(
        "flex w-72 flex-col overflow-hidden rounded-md text-sm",
        className,
      )}
    >
      {active ? (
        <CategoryPanel
          category={active}
          onBack={() => setActiveId(null)}
          textOverrides={tx}
        />
      ) : (
        <CategoriesView
          categories={categories}
          heading={tx.heading ?? "Filter"}
          onSelect={(id) => setActiveId(id)}
          footer={footer}
        />
      )}
    </div>
  );
}

function CategoriesView({
  categories,
  heading,
  onSelect,
  footer,
}: {
  categories: FilterMenuCategory[];
  heading: string;
  onSelect: (id: string) => void;
  footer?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-2 border-b px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <FilterGlyph className="size-3.5" />
        <span>{heading}</span>
      </div>
      <ul className="flex flex-col py-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const selectedCount = cat.selectedIds.length;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onSelect(cat.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm",
                  "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                )}
              >
                {Icon ? (
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <span className="size-4" aria-hidden />
                )}
                <span className="flex-1 truncate">{cat.label}</span>
                {selectedCount > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[10px] font-medium tabular-nums text-primary">
                    {selectedCount}
                  </span>
                ) : null}
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/70 transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          );
        })}
      </ul>
      {footer ? <div className="border-t px-3 py-2">{footer}</div> : null}
    </>
  );
}

function CategoryPanel({
  category,
  onBack,
  textOverrides,
}: {
  category: FilterMenuCategory;
  onBack: () => void;
  textOverrides: FilterMenuTextOverrides;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return category.options;
    return category.options.filter((o) =>
      [o.label, o.description ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [query, category.options]);

  const placeholder =
    category.searchPlaceholder ??
    textOverrides.searchPlaceholder ??
    `Search ${category.label.toLowerCase()}…`;

  const isSelected = (id: string) => category.selectedIds.includes(id);

  return (
    <>
      <div className="flex items-center gap-1.5 border-b px-2 py-1.5">
        <button
          type="button"
          onClick={onBack}
          aria-label={textOverrides.back ?? "Back"}
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground",
            "hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:outline-none",
          )}
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium">{category.label}</span>
        {category.selectedIds.length > 0 && category.onClear ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={category.onClear}
            className="ml-auto h-auto px-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {textOverrides.clear ?? "Clear"}
          </Button>
        ) : null}
      </div>

      <div className="relative border-b px-2.5 py-1.5">
        <Search className="absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-8 w-full bg-transparent pl-7 pr-6 text-sm outline-none",
            "placeholder:text-muted-foreground",
          )}
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 inline-flex size-4 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        ) : null}
      </div>

      <ul
        role="listbox"
        aria-multiselectable={category.multiple}
        className="max-h-72 overflow-auto py-1"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-muted-foreground">
            {textOverrides.noResults ?? "No results"}
          </li>
        ) : null}
        {filtered.map((opt) => {
          const Icon = opt.icon;
          const selected = isSelected(opt.id);
          return (
            <li key={opt.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => category.onToggle(opt.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm",
                  "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                  selected && "bg-accent/40",
                )}
              >
                {Icon ? (
                  <Icon
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground",
                      opt.iconClassName,
                    )}
                  />
                ) : opt.dotColorClass ? (
                  <span
                    className={cn(
                      "size-2.5 shrink-0 rounded-full",
                      opt.dotColorClass,
                    )}
                  />
                ) : (
                  <span className="size-4" aria-hidden />
                )}
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                {typeof opt.count === "number" ? (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {opt.count}
                  </span>
                ) : null}
                {selected ? (
                  <Check className="size-3.5 shrink-0 text-primary" />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** Tiny left-leaning glyph that mirrors the funnel icon used in the example. */
function FilterGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M2.5 4h11" />
      <path d="M4.5 8h7" />
      <path d="M6.5 12h3" />
    </svg>
  );
}
