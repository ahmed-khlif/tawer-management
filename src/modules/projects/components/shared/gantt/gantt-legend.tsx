"use client";

export default function GanttLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/70 bg-background px-4 py-3 text-xs text-muted-foreground">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
        Task states
      </span>
      <div className="flex items-center gap-1.5">
        <div className="size-2 rounded-full" style={{ backgroundColor: "var(--pm-task-in-progress-dot)" }} />
        <span>In Progress</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="size-2 rounded-full" style={{ backgroundColor: "var(--pm-task-done-dot)" }} />
        <span>Completed</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="size-2 rounded-full" style={{ backgroundColor: "var(--pm-task-in-review-dot)" }} />
        <span>Review</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="size-2 rounded-full" style={{ backgroundColor: "var(--pm-task-backlog-dot)" }} />
        <span>To Do</span>
      </div>
      <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
        Work items
      </span>
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-4 rounded-sm bg-primary/65" />
        <span>Sprint</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="h-2.5 w-4 rounded-sm"
          style={{ backgroundColor: "var(--pm-project-running-accent)" }}
        />
        <span>Epic</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="size-2 rotate-45 rounded-[2px] border border-primary/40 bg-primary/80" />
        <span>Milestone</span>
      </div>
    </div>
  );
}
