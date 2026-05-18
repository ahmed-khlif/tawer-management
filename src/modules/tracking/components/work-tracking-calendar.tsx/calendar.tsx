"use client";
import { WorkedDayTrackingType } from "../../types";
import { useLocale, useTranslations } from "next-intl";
import { WORK_MODE_COLORS } from "../../utils/colors";
import { HeatmapCalendar, HeatmapCell } from "@/components/heatmap-calendar";

interface Props {
  data: WorkedDayTrackingType[];
  from: Date;
  to: Date;
}

export function WorkedDaysCalendar({ data, from, to }: Props) {
  const t = useTranslations("modules.tracking.workedDaysTracking.calendar");
  const locale = useLocale(); // get current locale from next-intl

  const nivoColorScale = [
    WORK_MODE_COLORS.empty, // Restored back to the white/gray color the user requested
    WORK_MODE_COLORS.office,
    WORK_MODE_COLORS.remote,
    WORK_MODE_COLORS.mixed,
  ];

  const chartData = data.map((item) => {
    let colorIndex = 0;
    if (item.workMode === "Office") colorIndex = 1;
    if (item.workMode === "Remote") colorIndex = 2;
    if (item.workMode === "Mixed") colorIndex = 3;

    return {
      date: item.day.split("T")[0],
      value: colorIndex,
      meta: item,
    };
  });

  const rangeDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 3600 * 24)) + 1;

  return (
    <div className="space-y-4">
      <HeatmapCalendar
        className="border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75"
        data={chartData}
        endDate={to}
        rangeDays={rangeDays}
        palette={nivoColorScale}
        valueToLevel={(v) => v}
        cellSize={11}
        cellGap={3}
        legend={{
          show: false // We will use our custom legend below to match the exact labels
        }}
        renderTooltip={(cell: HeatmapCell) => {
          if (cell.disabled || !cell.meta) {
            return (
              <div className="text-sm">
                <div className="text-muted-foreground">{cell.label}</div>
                <div className="font-medium text-foreground">{t("legend.none") || "No activity"}</div>
              </div>
            );
          }

          const details = cell.meta as WorkedDayTrackingType;
          const formattedDay = new Date(details.day).toLocaleDateString(locale, {
            weekday: "short",
            day: "2-digit",
            month: "short"
          });

          return (
            <div className="inline-block rounded-md px-1 py-1 text-xs min-w-[120px]">
              <p className="font-semibold mb-2">{formattedDay}</p>
              <div className="space-y-1">
                <p className="flex justify-between text-muted-foreground">
                  <span>{t("office") || "Office"}:</span>
                  <span className="font-medium text-foreground ml-2">{details.officeHours}h</span>
                </p>
                <p className="flex justify-between text-muted-foreground">
                  <span>{t("remote") || "Remote"}:</span>
                  <span className="font-medium text-foreground ml-2">{details.remoteHours}h</span>
                </p>
                <div className="mt-2 border-t border-border pt-2 flex justify-between">
                  <span className="font-bold text-foreground">{t("total") || "Total"}:</span>
                  <span className="font-bold text-primary">{details.totalHours}h</span>
                </div>
              </div>
            </div>
          );
        }}
      />

      {/* Custom Legend to match exact categories instead of More/Less */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground px-1">
        <Legend color={WORK_MODE_COLORS.office} label={t("legend.office") || "Office"} />
        <Legend color={WORK_MODE_COLORS.remote} label={t("legend.remote") || "Remote"} />
        <Legend color={WORK_MODE_COLORS.mixed} label={t("legend.mixed") || "Mixed"} />
        <Legend color={WORK_MODE_COLORS.empty} label={t("legend.none") || "None"} />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-3 w-3 rounded-[3px] ring-1 ring-border/50 ring-offset-1 ring-offset-background"
        style={{ backgroundColor: color }}
      />
      <span className="font-medium">{label}</span>
    </div>
  );
}