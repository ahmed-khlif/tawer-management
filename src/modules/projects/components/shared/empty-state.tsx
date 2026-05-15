import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptyStateProps {
  /** Main empty title (kept for backwards-compat with existing callers). */
  message: string;
  /** Optional secondary line. */
  description?: string;
  /** Optional Lucide-style icon component to render in the media slot. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional action node (e.g. a "Create" button). */
  action?: React.ReactNode;
  /** Override container class (e.g. drop the full-viewport min-height). */
  className?: string;
  /** When true, renders compact (no min-height, smaller padding). */
  compact?: boolean;
}

/**
 * Project-wide empty state. Wraps shadcn's `Empty` primitive while keeping the
 * legacy `{ message, description }` API so existing call sites keep working.
 *
 * Prefer passing `icon` and `action` for richer screens.
 */
export function EmptyState({
  message,
  description,
  icon: Icon,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center",
        compact ? "py-6" : "min-h-[calc(100vh-16rem)] py-12",
        className,
      )}
    >
      <Empty className="border-dashed border w-full max-w-md bg-card/30">
        <EmptyHeader>
          {Icon ? (
            <EmptyMedia variant="icon">
              <Icon className="size-5" />
            </EmptyMedia>
          ) : null}
          <EmptyTitle>{message}</EmptyTitle>
          {description ? <EmptyDescription>{description}</EmptyDescription> : null}
        </EmptyHeader>
        {action ? <EmptyContent>{action}</EmptyContent> : null}
      </Empty>
    </div>
  );
}
