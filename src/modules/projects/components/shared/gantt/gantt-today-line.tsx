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
      className="absolute top-0 z-20 pointer-events-none"
      style={{ left: position }}
    >
      {/* TODAY label pill */}
      <div className="absolute -top-5 -translate-x-1/2 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap bg-destructive text-destructive-foreground">
        TODAY
      </div>
      {/* Vertical line */}
      <div
        className="w-px"
        style={{
          height: totalHeight,
          backgroundColor: "var(--pm-progress-fill-overdue)",
          opacity: 0.7,
        }}
      />
    </div>
  );
}
