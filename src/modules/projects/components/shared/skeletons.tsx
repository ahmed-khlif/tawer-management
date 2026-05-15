"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Single task card skeleton (kanban-style). */
export function TaskCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="flex flex-col gap-2.5 py-3">
        <div className="flex items-start gap-2">
          <Skeleton className="size-3.5 mt-0.5 rounded-sm" />
          <Skeleton className="size-4 mt-0.5 rounded-sm" />
          <div className="flex flex-col flex-1 gap-1.5 min-w-0">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="border-t py-2 px-3">
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-3 w-24 ml-2" />
      </CardFooter>
    </Card>
  );
}

/** Single task list-row skeleton. */
export function TaskRowSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex items-start gap-3 py-4">
        <Skeleton className="size-4 mt-1 rounded-sm" />
        <div className="flex grow flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 flex-1 max-w-md" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="size-6 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/** Vertical stack of task row skeletons for the list view. */
export function TaskListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <TaskRowSkeleton key={i} />
      ))}
    </div>
  );
}

/** Horizontal kanban board skeleton (3 columns × 3 cards). */
export function KanbanBoardSkeleton({
  columns = 3,
  cardsPerColumn = 3,
}: {
  columns?: number;
  cardsPerColumn?: number;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto py-2">
      {Array.from({ length: columns }).map((_, col) => (
        <div
          key={col}
          className="flex flex-col gap-2 w-72 shrink-0 rounded-lg bg-muted/40 p-2"
        >
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          {Array.from({ length: cardsPerColumn }).map((__, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Generic card-based grid skeleton (epics, milestones, sprints, members). */
export function CardGridSkeleton({
  count = 6,
  cardClassName,
}: {
  count?: number;
  cardClassName?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className={cn(cardClassName)}>
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-2/3 mb-1.5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Header strip skeleton for project detail and similar pages. */
export function HeaderStripSkeleton() {
  return (
    <div className="flex flex-col gap-3 pb-4 border-b">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-1/3" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}
