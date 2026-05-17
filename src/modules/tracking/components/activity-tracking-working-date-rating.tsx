"use client";

import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MessageSquare,
  Star,
  TimerReset
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import StarRating from "@/components/star-rating/input";
import { useLanguages } from "@/hooks/use-languages";
import { cn } from "@/lib/utils";
import useUserActivity from "@/modules/tracking/hook/use-user-activity";
import type { ActivityTrackingType } from "@/modules/tracking/types";
import { getMoodEmoji } from "@/utils/emojies";
import { formatTimeSpentFromMinutesToHours } from "@/utils/format-time";
import { useTranslations } from "next-intl";

import { deviceConfig } from "../utils/devices";
import { WorkerRatingPopup } from "./worker-rating-pop-up";

interface Props {
  userId: string;
  isMyProfile?: boolean;
}

export default function ActivityTrackingAndWorkerDateRating({
  userId,
  isMyProfile = false
}: Props) {
  const t = useTranslations("modules.tracking.userActivity");
  const paginationContent = useTranslations("shared.pagination");

  const { activity, activityIsLoading, activityError, setPage, page, pagesNumber, records } =
    useUserActivity({
      userId,
      isMyProfile
    });
  const { currentLanguage } = useLanguages();

  const [workedDayIdToRate, setWorkedDayIdToRate] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const summary = useMemo(() => {
    const totalSessions = activity?.reduce((acc, day) => acc + day.sessions.length, 0) ?? 0;
    const totalMinutes =
      activity?.reduce(
        (acc, day) =>
          acc + day.sessions.reduce((sessionAcc, session) => sessionAcc + session.timeSpentInMinutes, 0),
        0
      ) ?? 0;
    const ratedDays =
      activity?.filter((day) => typeof day.performanceRating === "number" && day.performanceRating > 0)
        .length ?? 0;

    return {
      totalSessions,
      totalMinutes,
      ratedDays
    };
  }, [activity]);

  if (activityIsLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="text-muted-foreground flex items-center justify-center p-16">
          <div className="flex flex-col items-center gap-6">
            <div className="relative inline-flex h-12 w-12">
              <div className="border-muted-foreground/10 border-t-primary absolute inset-0 animate-spin rounded-full border-3" />
              <div className="bg-primary/20 absolute inset-2 animate-pulse rounded-full" />
            </div>
            <div className="text-center">
              <p className="text-foreground text-base font-semibold">{t("loadingTitle")}</p>
              <p className="text-muted-foreground mt-2 text-sm">{t("loadingSubtitle")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activityError || !activity?.length) {
    return (
      <Card className="border-border/50">
        <CardContent className="text-muted-foreground flex items-center justify-center p-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-muted/60 rounded-full p-4">
              <Calendar className="text-muted-foreground/70 size-8" />
            </div>
            <div>
              <p className="text-foreground text-lg font-semibold">{t("noActivityTitle")}</p>
              <p className="text-muted-foreground mt-1 text-sm">{t("noActivitySubtitle")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15">
                <Activity className="size-5" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold tracking-tight">{t("activityTimelineTitle")}</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Review daily sessions, mood, manager feedback, and notes in one cleaner workstream.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[420px]">
              <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Tracked days
                </p>
                <p className="mt-2 text-2xl font-semibold">{records}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Sessions
                </p>
                <p className="mt-2 text-2xl font-semibold">{summary.totalSessions}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Logged time
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatTimeSpentFromMinutesToHours(summary.totalMinutes)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1.5 rounded-full bg-background/80 px-3 py-1 text-xs">
              <TimerReset className="size-3.5" />
              {summary.totalSessions} tracked sessions
            </Badge>
            <Badge variant="outline" className="gap-1.5 rounded-full bg-background/80 px-3 py-1 text-xs">
              <Star className="size-3.5" />
              {summary.ratedDays} rated days
            </Badge>
            <Badge variant="outline" className="gap-1.5 rounded-full bg-background/80 px-3 py-1 text-xs">
              <Calendar className="size-3.5" />
              Page {page} of {pagesNumber}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {activity.map((dayActivity: ActivityTrackingType, dayIndex: number) => {
          const workedMinutes = dayActivity.sessions.reduce(
            (acc, session) => acc + session.timeSpentInMinutes,
            0
          );

          return (
            <Collapsible
              key={dayActivity.id}
              open={openItems[dayActivity.id]}
              onOpenChange={() => toggleItem(dayActivity.id)}
              className="group"
            >
              <Card
                className={cn(
                  "border-border/60 overflow-hidden bg-card/95 shadow-sm transition-all duration-200",
                  openItems[dayActivity.id]
                    ? "ring-border bg-accent/5 ring-1"
                    : "hover:border-border/80 hover:bg-accent/5"
                )}
              >
                <div className="flex items-center justify-between gap-3 p-4 transition-colors sm:p-5">
                  <CollapsibleTrigger asChild>
                    <div className="flex flex-1 cursor-pointer flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/6 text-primary/80 group-hover:text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/10 transition-colors">
                          <Calendar className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold sm:text-base">
                            {dayActivity.createdAt
                              ? dayActivity.createdAt.toLocaleDateString(currentLanguage.code, {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })
                              : `Day ${dayIndex + 1}`}
                          </p>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                              <Clock className="size-3" />
                              {t("sessions", {
                                count: dayActivity.sessions.length
                              })}
                            </p>
                            <Badge variant="outline" className="bg-background/80 font-mono text-[11px]">
                              {formatTimeSpentFromMinutesToHours(workedMinutes)}
                            </Badge>
                            <div className="border-border/50 flex items-center gap-2 border-l pl-2">
                              {dayActivity.dailyMood !== undefined && (
                                <span className="text-sm" title={t("mood")}>
                                  {getMoodEmoji(dayActivity.dailyMood)}
                                </span>
                              )}

                              {dayActivity.performanceRating !== undefined && (
                                <div
                                  className="flex items-center gap-1 text-xs text-yellow-500"
                                  title={t("managerRating")}
                                >
                                  <Star className="size-3 fill-current" />
                                  <span className="font-semibold">{dayActivity.performanceRating}</span>
                                </div>
                              )}

                              {dayActivity.managerNotes && (
                                <MessageSquare className="text-muted-foreground size-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 lg:justify-end">
                        <div className="hidden text-right xl:block">
                          <p className="text-muted-foreground mb-0.5 text-[10px] font-medium tracking-tight uppercase">
                            {t("workedTime")}
                          </p>
                          <Badge
                            variant="outline"
                            className="bg-background border-primary/20 text-primary font-mono"
                          >
                            {formatTimeSpentFromMinutesToHours(workedMinutes)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/85 px-2 py-1 shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8 shrink-0 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWorkedDayIdToRate(dayActivity.id);
                            }}
                            title={t("rateWorkerDay")}
                          >
                            <Star className="size-4" />
                          </Button>
                          <div className="h-5 w-px bg-border/70" />
                          <ChevronDown
                            className={cn(
                              "text-muted-foreground size-4 transition-transform duration-200",
                              openItems[dayActivity.id] && "rotate-180"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <CardContent className="bg-muted/20 space-y-6 border-t p-4 pt-5 sm:p-5">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.9fr)]">
                      <div className="space-y-2.5">
                        <p className="text-muted-foreground px-1 text-[10px] font-bold tracking-widest uppercase">
                          {t("workSession")}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {dayActivity.sessions.map((session, idx) => {
                            const device = deviceConfig[session.device];
                            const DeviceIcon = device.icon;

                            return (
                              <div
                                key={idx}
                                className="bg-background flex items-center justify-between rounded-xl border p-3 shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-primary/40 h-2 w-2 animate-pulse rounded-full" />

                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium tabular-nums">
                                      {t("period", {
                                        from: session.startTime
                                          ? session.startTime.toLocaleTimeString(currentLanguage.code, {
                                              hour: "2-digit",
                                              minute: "2-digit"
                                            })
                                          : "--:--",
                                        to: session.endTime
                                          ? session.endTime.toLocaleTimeString(currentLanguage.code, {
                                              hour: "2-digit",
                                              minute: "2-digit"
                                            })
                                          : "--:--"
                                      })}
                                    </span>

                                    <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
                                      <DeviceIcon className="h-3 w-3" />
                                      <span>{t(`deviceType.${device.label}`)}</span>
                                    </div>
                                  </div>
                                </div>

                                {session.startTime && session.endTime && (
                                  <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-[10px] font-bold">
                                    {formatTimeSpentFromMinutesToHours(session.timeSpentInMinutes)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid content-start gap-3">
                        {dayActivity.dailyMood !== undefined && (
                          <div className="bg-background flex items-center gap-3 rounded-xl border p-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/10 text-pink-600">
                              <Heart className="size-4 fill-current" />
                            </div>
                            <div className="flex-1">
                              <p className="text-muted-foreground text-[10px] font-medium tracking-tight uppercase">
                                {t("mood")}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getMoodEmoji(dayActivity.dailyMood)}</span>
                                <span className="text-sm font-semibold">{dayActivity.dailyMood}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-background flex items-center gap-3 rounded-xl border p-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600">
                            <Star className="size-4 fill-current" />
                          </div>
                          <div className="flex-1">
                            <p className="text-muted-foreground text-[10px] font-medium tracking-tight uppercase">
                              {t("managerRating")}
                            </p>
                            <StarRating rating={dayActivity.performanceRating} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 pt-1 sm:grid-cols-2">
                      {dayActivity.workerNotes && (
                        <div className="bg-background flex items-start gap-3 rounded-xl border p-3">
                          <MessageSquare className="text-muted-foreground mt-1 size-4 shrink-0" />
                          <div>
                            <p className="text-muted-foreground text-[10px] font-medium tracking-tight uppercase">
                              {t("workerNotes")}
                            </p>
                            <p className="text-foreground/80 mt-0.5 text-xs leading-relaxed italic">
                              {dayActivity.workerNotes}
                            </p>
                          </div>
                        </div>
                      )}

                      {dayActivity.managerNotes && (
                        <div className="bg-background flex items-start gap-3 rounded-xl border p-3">
                          <MessageSquare className="text-muted-foreground mt-1 size-4 shrink-0" />
                          <div>
                            <p className="text-muted-foreground text-[10px] font-medium tracking-tight uppercase">
                              {t("managerNotes")}
                            </p>
                            <p className="text-foreground/80 mt-0.5 text-xs leading-relaxed italic">
                              {dayActivity.managerNotes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t px-1 pt-2">
        <p className="text-muted-foreground text-xs font-medium">
          {paginationContent.rich("selected", { page, pages: pagesNumber, records })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="h-8 px-3 text-xs"
          >
            <ChevronLeft className="mr-1 size-3.5" />
            {paginationContent("previous")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === pagesNumber}
            className="h-8 px-3 text-xs"
          >
            {paginationContent("next")}
            <ChevronRight className="ml-1 size-3.5" />
          </Button>
        </div>
      </div>

      {workedDayIdToRate && (
        <WorkerRatingPopup
          workDayId={workedDayIdToRate}
          triggerOpenning={workedDayIdToRate !== null}
          onClose={() => setWorkedDayIdToRate(null)}
        />
      )}
    </section>
  );
}
