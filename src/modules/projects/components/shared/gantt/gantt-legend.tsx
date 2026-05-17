"use client";

export default function GanttLegend() {
  return (
    <div className="flex flex-wrap items-center gap-6 border-t border-border bg-background px-4 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div
          className="size-2 rounded-full"
          style={{ backgroundColor: "var(--pm-task-in-progress-dot)" }}
        />
        <span>In Progress</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="size-2 rounded-full"
          style={{ backgroundColor: "var(--pm-task-done-dot)" }}
        />
        <span>Completed</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="size-2 rounded-full"
          style={{ backgroundColor: "var(--pm-task-in-review-dot)" }}
        />
        <span>Review</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="size-2 rounded-full"
          style={{ backgroundColor: "var(--pm-task-backlog-dot)" }}
        />
        <span>To Do</span>
      </div>
      <span className="ml-auto hidden text-muted-foreground/50 sm:inline">
        Shift + Scroll to pan horizontally
      </span>
    </div>
  );
}
