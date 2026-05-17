"use client";

interface GanttTodayLineProps {
  position: number;
  totalHeight: number;
}

export default function GanttTodayLine({
  position,
  totalHeight,
}: GanttTodayLineProps) {
  if (position <= 0) return null;

  return (
    <div
      className="pointer-events-none absolute top-0 z-20"
      style={{ left: position }}
    >
      <div className="absolute -top-5 -translate-x-1/2 whitespace-nowrap rounded-full bg-destructive px-2 py-0.5 text-[9px] font-semibold text-destructive-foreground shadow-sm">
        TODAY
      </div>
      <div
        className="w-px"
        style={{
          height: totalHeight,
          backgroundColor: "var(--pm-progress-fill-overdue)",
          opacity: 0.78,
          boxShadow: "0 0 10px hsl(var(--destructive) / 0.25)",
        }}
      />
      <div className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-destructive shadow-sm" />
    </div>
  );
}
