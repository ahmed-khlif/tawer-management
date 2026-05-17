"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Bell,
  BellOff,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  MailOpen,
  Settings2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/page-loader";
import NotificationContainer from "./notification-container";
import useNotifications from "../hook/use-notifications";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { MetricCard } from "@/modules/projects/components/shared/metric-card";
import { EmptyState } from "@/modules/projects/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBanner } from "@/components/error-banner";

type NotificationFilter = "all" | "unread" | "seen";

export default function UserNotifications() {
  const t = useTranslations("modules.notifications");
  const paginationContent = useTranslations("shared.pagination");
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const apiStatus =
    filter === "all" ? undefined : filter === "unread" ? "unseen" : "seen";

  const {
    setPage,
    page,
    pagesNumber,
    records,
    notifications,
    notificationsAreLoading,
    notificationsError,
    markNotificationsAsSeen,
  } = useNotifications({ status: apiStatus });

  const unreadCount = notifications?.filter((item) => item.unread).length ?? 0;
  const recentCount =
    notifications?.filter((item) => {
      const createdAt = new Date(item.createdAt).getTime();
      return Date.now() - createdAt <= 1000 * 60 * 60 * 24 * 7;
    }).length ?? 0;
  const readCount = Math.max(0, records - unreadCount);
  const latestItem = notifications?.[0] ?? null;

  const filterMeta = useMemo(() => {
    switch (filter) {
      case "unread":
        return {
          title: "Unread notifications",
          description: "Only the updates that still need attention right now.",
        };
      case "seen":
        return {
          title: "Seen notifications",
          description: "Recent activity you have already opened or reviewed.",
        };
      default:
        return {
          title: "All notifications",
          description: "A full stream of reminders, alerts, and workspace activity.",
        };
    }
  }, [filter]);

  useEffect(() => {
    if (notifications) {
      void markNotificationsAsSeen();
    }
  }, [notifications, markNotificationsAsSeen]);

  if (notificationsAreLoading) {
    return <Loading />;
  }

  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={Bell}
        title={t("title")}
        description="Track new alerts, activity updates, and workflow signals in the same polished workspace rhythm as project management."
        metrics={[
          {
            icon: MailOpen,
            value: records,
            label: "total notifications",
            tone: "primary",
          },
          unreadCount > 0
            ? {
                icon: Sparkles,
                value: unreadCount,
                label: "unread",
                tone: "warning",
              }
            : {
                icon: CheckCheck,
                label: "All seen",
                tone: "success",
              },
          recentCount > 0
            ? {
                icon: Clock3,
                value: recentCount,
                label: "last 7 days",
                tone: "info",
              }
            : false,
        ]}
        actions={
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/dashboard/notifications/settings">
              <Settings2 className="size-4" />
              Notification settings
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={MailOpen}
          label="Unread right now"
          value={unreadCount}
          hint="Items that still need your attention"
          tone={unreadCount > 0 ? "warning" : "success"}
          emphasize={unreadCount > 0}
        />
        <MetricCard
          icon={Clock3}
          label="Recent activity"
          value={recentCount}
          hint="Notifications received during the last week"
          tone="info"
        />
        <MetricCard
          icon={CheckCheck}
          label="Read items"
          value={readCount}
          hint="Notifications already reviewed"
          tone="primary"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="border-border/70 bg-card/95 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-col gap-3 border-b border-border/60 pb-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Activity stream
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">
                    {filterMeta.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {filterMeta.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                  <Filter className="size-3.5 text-primary" />
                  Filter feed
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Tabs
                  value={filter}
                  onValueChange={(value) => {
                    setFilter(value as NotificationFilter);
                    setPage(1);
                  }}
                >
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="seen">Seen</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button asChild variant="outline" size="sm" className="gap-1.5 self-start">
                  <Link href="/dashboard/notifications/settings">
                    <Settings2 className="size-4" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>

            {notificationsError ? (
              <ErrorBanner error="Unable to load notifications right now." />
            ) : !notifications || notifications.length === 0 ? (
              <EmptyState
                compact
                icon={BellOff}
                message={t("empty")}
                description="New alerts, reminders, and workflow updates will appear here as soon as they arrive."
                className="min-h-0 py-10"
              />
            ) : (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <NotificationContainer notification={item} key={item.id} />
                ))}
              </div>
            )}

            {notifications && notifications.length > 0 ? (
              <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-muted-foreground">
                  {paginationContent.rich("selected", {
                    page,
                    pages: pagesNumber,
                    records,
                  })}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="size-3.5" />
                    {paginationContent("previous")}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pagesNumber}
                    onClick={() => setPage(page + 1)}
                    className="gap-1"
                  >
                    {paginationContent("next")}
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="border-border/70 bg-card/95 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Notification pulse
                </p>
                <h3 className="mt-1 text-lg font-semibold">What this page tells you</h3>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="text-sm font-medium text-foreground">Unread workload</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {unreadCount > 0
                      ? `${unreadCount} notification${unreadCount > 1 ? "s still need" : " still needs"} your attention.`
                      : "Everything in your feed has already been seen."}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="text-sm font-medium text-foreground">Latest update</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {latestItem
                      ? latestItem.title
                      : "Your next project or reminder update will appear here."}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="text-sm font-medium text-foreground">Feed status</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {filter === "all"
                      ? "You are viewing the full activity stream."
                      : filter === "unread"
                        ? "You are focusing only on items that still need attention."
                        : "You are reviewing updates already opened."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageShell>
  );
}
