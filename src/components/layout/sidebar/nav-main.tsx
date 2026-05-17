"use client";
import * as React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ChevronRight,
  UserIcon,
  UsersIcon,
  type LucideIcon,
  CalendarIcon,
  LockIcon,
  PaletteIcon,
  BellIcon,
  User,
  Settings,
  SquareCheckIcon,
  House,
  Server,
  SquareKanbanIcon,
  Scale,
  Calculator,
  Activity,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UserType } from "@/modules/users/types/users";
import useUser from "@/modules/auth/hooks/users/use-user";
import { useTranslations } from "next-intl";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import { useMyReminders } from "@/modules/reminders/hooks/use-reminders";
import { canSeeAnalyticsNav } from "@/modules/analytics/utils/access";
import { canViewProjectActivity } from "@/modules/projects/utils/activity-access";

type NavGroup = {
  title: string;
  items: NavItem;
};

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  disabled?: boolean;
  items?: NavItem;
}[];

export function getNavItems({
  user,
  t,
  pendingReminderCount = 0,
}: {
  user: UserType;
  t: (key: string) => string;
  pendingReminderCount?: number;
}): NavGroup[] {
  const canViewAnalytics = canSeeAnalyticsNav(user.roles);
  const canViewActivityHistory = canViewProjectActivity(user.roles);

  return [
    {
      title: t("navigation.projectsManagement"),
      items: [
        {
          title: t("navigation.welcome"),
          href: "/dashboard",
          icon: House,
        },
        ...(hasPermissions(user.roles, "projectEstimator", "view") ? [
          {
            title: t("navigation.estimator"),
            href: "/dashboard/estimator",
            icon: Calculator,
          }
        ] : []),
        {
          title: "Project Templates",
          href: "/dashboard/project-templates",
          icon: Sparkles,
          disabled: !hasPermissions(user.roles, "projectsManagement", "view"),
        },
        {
          title: t("navigation.projectsManagement"),
          href: "/dashboard/projects",
          icon: SquareKanbanIcon
        },
        ...(canViewActivityHistory
          ? [
              {
                title: "Activity History",
                href: "/dashboard/activity",
                icon: Activity,
              },
            ]
          : []),
      ]
    },
    {
      title: "Administration",
      items: [
        {
          title: t("navigation.todoList"),
          href: "#",
          icon: SquareCheckIcon,
          items: [
            {
              title: t("navigation.personalTasks"),
              href: "/dashboard/todo-list/personal",
            },
            {
              title: t("navigation.projectTasks"),
              href: "/dashboard/todo-list/project",
            }
          ]
        },
        {
          title: t("navigation.calendar"),
          href: "#",
          icon: CalendarIcon,
          items: [
            {
              title: t("navigation.meetings"),
              href: "/dashboard/calendar/meetings",
              disabled: !hasPermissions(user.roles, "meetingsManagement", "view")
            },
            {
              title: t("navigation.events"),
              href: "/dashboard/calendar/events",
              disabled: !hasPermissions(user.roles, "eventsManagement", "view")
            },
            {
              title: t("navigation.personalCalendar"),
              href: "/dashboard/calendar/personal"
            }
          ]
        },

        {
          title: t("navigation.usersManagement"),
          href: "#",
          icon: UsersIcon,
          items: [
            {
              title: t("navigation.users"),
              href: "/dashboard/users",
              disabled: !hasPermissions(user.roles, "usersManagement", "view")
            },
            {
              title: t("navigation.teams"),
              href: "/dashboard/users/teams",
              disabled: !hasPermissions(user.roles, "teamsManagement", "view")
            }
          ]
        },

        {
          title: t("navigation.infrastructure"),
          href: "#",
          icon: Server,
          items: [
            {
              title: t("navigation.servers"),
              href: "/dashboard/infrastructure/servers",
              disabled: !hasPermissions(user.roles, "serversManagement", "view")
            },
            {
              title: t("navigation.services"),
              href: "/dashboard/infrastructure/services",
              disabled: !hasPermissions(user.roles, "servicesManagement", "view")
            },
          ]
        },
        {
          title: t("navigation.accountSettings"),
          href: "#",
          icon: Settings,
          items: [
            {
              title: t("navigation.account"),
              href: "/dashboard/account-settings/account",
              icon: UserIcon
            },
            {
              title: t("navigation.passwords"),
              href: "/dashboard/account-settings/password",
              icon: LockIcon
            },
            {
              title: t("navigation.appearance"),
              href: "/dashboard/account-settings/appearance",
              icon: PaletteIcon
            }
          ]
        },

        {
          title: t("navigation.notifications"),
          href: "/dashboard/notifications",
          icon: BellIcon,
          items: [
            {
              title: t("navigation.viewAllNotifications"),
              href: "/dashboard/notifications/view",
              icon: BellIcon
            },
            {
              title: t("navigation.notificationsSettings"),
              href: "/dashboard/notifications/settings",
              icon: Settings
            }
          ]
        },
        {
          title: "Reminders",
          href: "/dashboard/reminders",
          icon: BellIcon,
          isDataBadge: pendingReminderCount > 0 ? String(pendingReminderCount) : undefined,
        },
        ...(canViewAnalytics
          ? [
              {
                title: "Executive Analytics",
                href: "/dashboard/analytics",
                icon: Activity,
              },
            ]
          : []),

        {
          title: t("navigation.myProfile"),
          href: user ? `/dashboard/users/profile/me` : "#",
          icon: User
        },
        {
          title: "Company Rules",
          href: user ? `/dashboard/rules` : "#",
          icon: Scale
        }
      ]
    }
  ];
}

export function NavMain() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile } = useSidebar();
  const { user } = useUser();
  const t = useTranslations("shared.sidebar");
  const { data: reminderList } = useMyReminders({
    status: "PENDING",
    page: 1,
    limit: 20,
  });
  const pendingReminderCount = reminderList?.pagination.records ?? 0;
  const currentProjectTab = searchParams.get("tab") ?? "overview";
  const projectMatch = pathname.match(/\/dashboard\/projects\/([^/]+)$/);
  const projectBasePath = projectMatch ? pathname : null;
  const projectTabs = projectBasePath
    ? [
        { title: "Overview", href: `${projectBasePath}?tab=overview`, value: "overview" },
        { title: "Tasks", href: `${projectBasePath}?tab=tasks`, value: "tasks" },
        { title: "Planning", href: `${projectBasePath}?tab=planning`, value: "planning" },
        { title: "Members", href: `${projectBasePath}?tab=members`, value: "members" },
        { title: "Insights", href: `${projectBasePath}?tab=insights`, value: "insights" },
        // Only show Settings tab for users with edit permissions
        ...(user && (hasPermissions(user.roles, "projectsManagement", "edit") ||
           hasPermissions(user.roles, "projectsManagement", "delete"))
           ? [{ title: "Settings", href: `${projectBasePath}?tab=settings`, value: "settings" }]
           : []),
      ]
    : [];

  return (
    <>
      {user &&
        getNavItems({ user, t, pendingReminderCount }).map((nav, index) => (
          <React.Fragment key={nav.title}>
            <SidebarGroup>
              <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
              <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                  {nav.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {Array.isArray(item.items) && item.items.length > 0 ? (
                        <>
                          <div className="hidden group-data-[collapsible=icon]:block">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuButton tooltip={item.title}>
                                  {item.icon && <item.icon />}
                                  <span>{item.title}</span>
                                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                side={isMobile ? "bottom" : "right"}
                                align={isMobile ? "end" : "start"}
                                className="min-w-48 rounded-lg">
                                <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                                {item.items?.map((item) => (
                                  <DropdownMenuItem
                                    className={`hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10! ${item.disabled
                                      ? "pointer-events-none cursor-not-allowed opacity-50"
                                      : ""
                                      }`}
                                    asChild={!item.disabled}
                                    key={item.title}>
                                    {!item.disabled ? (
                                      <a href={item.href}>{item.title}</a>
                                    ) : (
                                      <span>{item.title}</span>
                                    )}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <Collapsible
                            className="group/collapsible block group-data-[collapsible=icon]:hidden"
                            defaultOpen={!!item.items.find((s) => s.href === pathname)}>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                className={`hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10 ${item.disabled
                                  ? "pointer-events-none cursor-not-allowed opacity-50"
                                  : ""
                                  }`}
                                tooltip={item.title}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item?.items?.map((subItem, key) => (
                                  <SidebarMenuSubItem key={key}>
                                    <SidebarMenuSubButton
                                      className={`hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10 ${subItem.disabled
                                        ? "pointer-events-none cursor-not-allowed opacity-50"
                                        : ""
                                        }`}
                                      isActive={pathname === subItem.href}
                                      asChild={!subItem.disabled}
                                      onClick={
                                        subItem.disabled ? (e) => e.preventDefault() : () => { }
                                      }>
                                      {!subItem.disabled ? (
                                        <Link
                                          href={subItem.href}
                                          target={subItem.newTab ? "_blank" : ""}>
                                          <span>{subItem.title}</span>
                                        </Link>
                                      ) : (
                                        <span>{subItem.title}</span>
                                      )}
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        </>
                      ) : (
                        <SidebarMenuButton
                          className={`hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10 ${item.disabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""
                            }`}
                          isActive={pathname === item.href}
                          tooltip={item.title}
                          asChild={!item.disabled}
                          onClick={item.disabled ? (e) => e.preventDefault() : () => { }}>
                          {!item.disabled ? (
                            <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                            </Link>
                          ) : (
                            <div>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                            </div>
                          )}
                        </SidebarMenuButton>
                      )}
                      {!!item.isComing && (
                        <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                          Coming
                        </SidebarMenuBadge>
                      )}
                      {!!item.isNew && (
                        <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
                          New
                        </SidebarMenuBadge>
                      )}
                      {!!item.isDataBadge && (
                        <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                          {item.isDataBadge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {index === 0 && projectBasePath && (
              <SidebarGroup>
                <SidebarGroupLabel>Project workspace</SidebarGroupLabel>
                <SidebarGroupContent>
                  <Collapsible defaultOpen className="group/collapsible">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Project workspace">
                        <SquareKanbanIcon />
                        <span>Project tabs</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {projectTabs.map((item) => (
                          <SidebarMenuSubItem key={item.value}>
                            <SidebarMenuSubButton isActive={currentProjectTab === item.value} asChild>
                              <Link href={item.href}>
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </React.Fragment>
        ))}
    </>
  );
}
