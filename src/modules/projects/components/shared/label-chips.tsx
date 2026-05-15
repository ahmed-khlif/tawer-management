"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export interface LabelChipsItem {
  id: string;
  name: string;
  color: string | null;
}

interface Props {
  labels: LabelChipsItem[];
  /** Maximum chips to show inline before collapsing into "+N". Defaults to 3. */
  max?: number;
  className?: string;
}

function chipStyle(color: string | null | undefined): React.CSSProperties | undefined {
  if (!color) return undefined;
  return {
    borderColor: color,
    color,
    backgroundColor: `${color}1a`,
  };
}

/**
 * Renders task-label chips with a "+N" overflow chip that opens a hover card
 * listing the hidden labels. Drop-in replacement for the previous inline
 * `flex flex-wrap` chips so cards & rows stay consistent.
 */
export function LabelChips({ labels, max = 3, className }: Props) {
  if (!labels.length) return null;

  const visible = labels.slice(0, max);
  const overflow = labels.slice(max);

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {visible.map((label) => (
        <Badge
          key={label.id}
          variant="outline"
          className="h-4 px-1.5 text-[9px] font-medium leading-none"
          style={chipStyle(label.color)}
          title={label.name}
        >
          {label.name}
        </Badge>
      ))}
      {overflow.length > 0 ? (
        <HoverCard openDelay={100} closeDelay={60}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="text-[9px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Show ${overflow.length} more labels`}
            >
              +{overflow.length}
            </button>
          </HoverCardTrigger>
          <HoverCardContent
            className="w-auto max-w-xs p-2"
            align="start"
            sideOffset={4}
          >
            <div className="flex flex-wrap gap-1">
              {overflow.map((label) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] font-medium leading-none"
                  style={chipStyle(label.color)}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          </HoverCardContent>
        </HoverCard>
      ) : null}
    </div>
  );
}
