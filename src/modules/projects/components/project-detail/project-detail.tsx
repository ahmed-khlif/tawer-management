"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  BrainCircuit,
  Calendar,
  CalendarRange,
  Flag,
  FolderKanban,
  LayoutList,
  ListChecks,
  Settings,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import {
  projectStatusClasses,
  projectTypeClasses,
  businessUnitClasses,
  businessUnitFallbackClasses,
} from "@/modules/projects/utils/badges/project-badges";
import { HeaderStripSkeleton } from "../shared/skeletons";
import useProject from "@/modules/projects/hooks/projects/use-project";
import useProjectPermissions from "@/modules/projects/hooks/permissions/use-project-permissions";
import AccessDenied from "@/components/error/access-denied";

const ProjectTasks = dynamic(() => import("./project-task/project-tasks"), {
  loading: () => <Skeleton className="h-96 w-full" />,
});
const ProjectMembers = dynamic(() => import("./members/project-members"), {
  loading: () => <Skeleton className="h-96 w-full" />,
});
const ProjectSprints = dynamic(() => import("./sprints/project-sprints"), {
  loading: () => <Skeleton className="h-96 w-full" />,
});
const ProjectEpics = dynamic(() => import("./epics/project-epics"), {
  loading: () => <Skeleton className="h-96 w-full" />,
});
const ProjectMilestones = dynamic(() => import("./milestones/project-milestones"), {
  loading: () => <Skeleton className="h-96 w-full" />,
});
const ProjectAnalyticsDashboard = dynamic(
  () => import("./analytics/project-analytics-dashboard"),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
  },
);
const ProjectAiInsightsTab = dynamic(
  () => import("./ai-insights/project-ai-insights-tab"),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
  },
);
const ProjectSettingsTab = dynamic(
  () => import("./settings/project-settings-tab"),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
  },
);
const ProjectOverviewTab = dynamic(
  () => import("./overview/project-overview-tab"),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
  },
);
const ProjectRemindersTab = dynamic(
  () => import("./reminders/project-reminders-tab"),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
  },
);
const ProjectBacklog = dynamic(
  () => import("./backlog/project-backlog"),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
  },
);
const ProjectCalendarTab = dynamic(
  () => import("./calendar/project-calendar-tab"),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
  },
);

interface Props {
  slug: string;
}

interface SubTabDef {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: boolean;
}

interface GroupDef {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: boolean;
  subTabs: SubTabDef[];
}

const tabTriggerClass =
  "relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none";

export default function ProjectDetail({ slug }: Props) {
  const t = useTranslations("modules.projects.project.details");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { project, projectIsLoading } = useProject(slug);
  const permissions = useProjectPermissions(slug);

  const groups = useMemo<GroupDef[]>(() => {
    if (!project) return [];

    const isAgile = project.projectType === "AGILE";

    return [
      {
        value: "overview",
        label: t("groups.overview", { defaultValue: "Overview" }),
        icon: FolderKanban,
        visible: permissions.canView,
        subTabs: [],
      },
      {
        value: "tasks",
        label: t("groups.tasks", { defaultValue: "Tasks" }),
        icon: ListChecks,
        visible: permissions.canViewTask,
        subTabs: [
          {
            value: "board",
            label: t("tabs.board", { defaultValue: "Board" }),
            icon: FolderKanban,
            visible: permissions.canViewTask,
          },
          {
            value: "backlog",
            label: t("tabs.backlog", { defaultValue: "Backlog" }),
            icon: LayoutList,
            visible: isAgile && permissions.canViewBacklog,
          },
        ].filter((s) => s.visible),
      },
      {
        value: "planning",
        label: t("groups.planning", { defaultValue: "Planning" }),
        icon: CalendarRange,
        visible:
          permissions.canViewCalendar ||
          permissions.canViewMilestone ||
          (isAgile && (permissions.canViewSprint || permissions.canViewEpic)),
        subTabs: [
          {
            value: "milestones",
            label: t("tabs.milestones", { defaultValue: "Milestones" }),
            icon: Flag,
            visible: permissions.canViewMilestone,
          },
          {
            value: "sprints",
            label: t("tabs.sprints", { defaultValue: "Sprints" }),
            icon: Sparkles,
            visible: isAgile && permissions.canViewSprint,
          },
          {
            value: "epics",
            label: t("tabs.epics", { defaultValue: "Epics" }),
            icon: LayoutList,
            visible: isAgile && permissions.canViewEpic,
          },
          {
            value: "calendar",
            label: t("tabs.calendar", { defaultValue: "Calendar" }),
            icon: Calendar,
            visible: permissions.canViewCalendar,
          },
        ].filter((s) => s.visible),
      },
      {
        value: "members",
        label: t("groups.members", { defaultValue: "Members" }),
        icon: Users,
        visible: permissions.canView,
        subTabs: [],
      },
      {
        value: "insights",
        label: t("groups.insights", { defaultValue: "Insights" }),
        icon: BarChart3,
        visible:
          permissions.canViewAnalytics ||
          permissions.canViewAiInsights ||
          permissions.canView,
        subTabs: [
          {
            value: "analytics",
            label: t("tabs.analytics", { defaultValue: "Analytics" }),
            icon: BarChart3,
            visible: permissions.canViewAnalytics,
          },
          {
            value: "ai-insights",
            label: t("tabs.aiInsights", { defaultValue: "AI Insights" }),
            icon: BrainCircuit,
            visible: permissions.canViewAiInsights,
          },
          {
            value: "reminders",
            label: t("tabs.reminders", { defaultValue: "Reminders" }),
            icon: Bell,
            visible: permissions.canView,
          },
        ].filter((s) => s.visible),
      },
      {
        value: "settings",
        label: t("groups.settings", { defaultValue: "Settings" }),
        icon: Settings,
        visible: permissions.canEdit || permissions.canDelete,
        subTabs: [],
      },
    ].filter((g) => g.visible && (g.subTabs.length > 0 || g.subTabs.length === 0));
  }, [permissions, project, t]);

  const requestedGroup = searchParams.get("tab");
  const requestedSub = searchParams.get("sub");

  // Back-compat: legacy URLs that used the old flat tab values, like
  // `?tab=board`, `?tab=backlog`, `?tab=sprints`, etc., still resolve.
  const legacyMap: Record<string, { group: string; sub?: string }> = {
    overview: { group: "overview" },
    board: { group: "tasks", sub: "board" },
    backlog: { group: "tasks", sub: "backlog" },
    "my-tasks": { group: "tasks", sub: "board" }, // collapsed into Board + "Mine only" toggle
    sprints: { group: "planning", sub: "sprints" },
    epics: { group: "planning", sub: "epics" },
    milestones: { group: "planning", sub: "milestones" },
    calendar: { group: "planning", sub: "calendar" },
    members: { group: "members" },
    reminders: { group: "insights", sub: "reminders" },
    analytics: { group: "insights", sub: "analytics" },
    "ai-insights": { group: "insights", sub: "ai-insights" },
    settings: { group: "settings" },
  };

  let activeGroup = requestedGroup ?? "";
  let activeSub = requestedSub ?? "";
  if (legacyMap[activeGroup]) {
    const legacy = legacyMap[activeGroup];
    activeGroup = legacy.group;
    activeSub = activeSub || legacy.sub || "";
  }

  if (!groups.find((g) => g.value === activeGroup)) {
    activeGroup = groups[0]?.value ?? "overview";
    activeSub = "";
  }

  const currentGroup = groups.find((g) => g.value === activeGroup);
  if (currentGroup && currentGroup.subTabs.length > 0) {
    if (!currentGroup.subTabs.find((s) => s.value === activeSub)) {
      activeSub = currentGroup.subTabs[0].value;
    }
  } else {
    activeSub = "";
  }

  const setActiveGroup = (group: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", group);
    params.delete("sub");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const setActiveSub = (sub: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", activeGroup);
    params.set("sub", sub);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const navigateToTab = (legacyTab: string) => {
    const mapped = legacyMap[legacyTab];
    if (!mapped) return setActiveGroup(legacyTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", mapped.group);
    if (mapped.sub) params.set("sub", mapped.sub);
    else params.delete("sub");
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (projectIsLoading) {
    return (
      <div className="space-y-4">
        <HeaderStripSkeleton />
        <Skeleton className="h-[28rem] w-full" />
      </div>
    );
  }

  if (!permissions.canView) return <AccessDenied />;

  if (!project)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Empty className="border-dashed border w-full max-w-md">
          <EmptyHeader>
            <EmptyTitle>{t("notFound.title")}</EmptyTitle>
            <EmptyDescription>{t("notFound.description")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );

  const projectName =
    (project as any).name || project.contents?.[0]?.name || "Unnamed Project";
  const projectInitials = projectName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase() ?? "")
    .join("");

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const startLabel = project.startTime ? dateFormatter.format(new Date(project.startTime)) : null;
  const endLabel = project.endTime ? dateFormatter.format(new Date(project.endTime)) : null;
  const buName = project.businessUnit ?? "";
  const buClass =
    businessUnitClasses[buName] ?? businessUnitFallbackClasses;

  return (
    <div className="space-y-4">
      <header className="mb-2">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/projects")}
            aria-label={t("header.back", { defaultValue: "Back to projects" })}
            className="mt-1"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Avatar className="size-11 mt-0.5 border bg-muted">
            <AvatarFallback className="text-sm font-semibold tracking-wide">
              {projectInitials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {projectName}
              </h1>
              {project.isFavorite ? (
                <Star
                  className="size-4 fill-primary text-primary"
                  aria-label={t("header.favorite", { defaultValue: "Starred" })}
                />
              ) : null}
              {project.isArchived ? (
                <Badge variant="secondary" className="font-normal">
                  {t("header.archived", { defaultValue: "Archived" })}
                </Badge>
              ) : null}
            </div>
            {project.description ? (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {project.description}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "font-normal",
                  projectTypeClasses[project.projectType],
                )}
              >
                {project.projectType === "AGILE"
                  ? t("header.agile", { defaultValue: "Agile" })
                  : t("header.freestyle", { defaultValue: "Freestyle" })}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "font-normal",
                  projectStatusClasses[project.status],
                )}
              >
                {project.status}
              </Badge>
              {buName ? (
                <Badge
                  variant="outline"
                  className={cn("font-normal", buClass)}
                >
                  {buName}
                </Badge>
              ) : null}
              {startLabel || endLabel ? (
                <HoverCard openDelay={120} closeDelay={80}>
                  <HoverCardTrigger asChild>
                    <Badge
                      variant="outline"
                      className="font-normal gap-1 cursor-default"
                    >
                      <CalendarRange className="size-3" />
                      {startLabel ?? "?"} – {endLabel ?? "?"}
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 p-3" align="start">
                    <div className="text-xs space-y-1.5">
                      {startLabel ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {t("header.start", { defaultValue: "Start" })}:
                          </span>
                          <span className="font-medium">{startLabel}</span>
                        </div>
                      ) : null}
                      {endLabel ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {t("header.end", { defaultValue: "Due" })}:
                          </span>
                          <span className="font-medium">{endLabel}</span>
                        </div>
                      ) : null}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : null}
              {typeof project.memberCount === "number" ||
              project.members ? (
                <Badge
                  variant="outline"
                  className="font-normal gap-1"
                  title={t("header.members", { defaultValue: "Members" })}
                >
                  <Users className="size-3" />
                  {project.memberCount ?? project.members?.length ?? 0}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <Tabs
        value={activeGroup}
        onValueChange={setActiveGroup}
        className="w-full"
      >
        <div className="sticky top-0 z-10 -mx-4 mb-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <TabsList className="h-auto flex-wrap bg-transparent p-0">
            {groups.map((group) => {
              const Icon = group.icon;
              return (
                <TabsTrigger
                  key={group.value}
                  value={group.value}
                  className={tabTriggerClass}
                >
                  <Icon className="size-4" />
                  {group.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {currentGroup && currentGroup.subTabs.length > 1 ? (
          <div className="mb-4">
            <ButtonGroup>
              {currentGroup.subTabs.map((sub) => {
                const Icon = sub.icon;
                const isActive = activeSub === sub.value;
                return (
                  <Button
                    key={sub.value}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    aria-pressed={isActive}
                    className="gap-1.5"
                    onClick={() => setActiveSub(sub.value)}
                  >
                    <Icon className="size-4" />
                    {sub.label}
                  </Button>
                );
              })}
            </ButtonGroup>
          </div>
        ) : null}

        <TabsContent value="overview" className="space-y-4 outline-none!">
          <ProjectOverviewTab
            project={project}
            permissions={permissions}
            onChangeTab={navigateToTab}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4 outline-none!">
          {activeSub === "backlog" ? (
            <ProjectBacklog project={project} permissions={permissions} />
          ) : (
            <ProjectTasks project={project} />
          )}
        </TabsContent>

        <TabsContent value="planning" className="outline-none!">
          {activeSub === "calendar" ? (
            <ProjectCalendarTab project={project} permissions={permissions} />
          ) : activeSub === "sprints" ? (
            <ProjectSprints project={project} />
          ) : activeSub === "epics" ? (
            <ProjectEpics project={project} permissions={permissions} />
          ) : (
            <ProjectMilestones project={project} permissions={permissions} />
          )}
        </TabsContent>

        <TabsContent value="members" className="outline-none!">
          <ProjectMembers project={project} />
        </TabsContent>

        <TabsContent value="insights" className="outline-none!">
          {activeSub === "ai-insights" ? (
            <ProjectAiInsightsTab projectId={project.id} />
          ) : activeSub === "reminders" ? (
            <ProjectRemindersTab project={project} permissions={permissions} />
          ) : (
            <ProjectAnalyticsDashboard projectId={project.id} />
          )}
        </TabsContent>

        <TabsContent value="settings" className="outline-none!">
          <ProjectSettingsTab project={project} permissions={permissions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
