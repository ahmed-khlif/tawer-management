import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectFilterTab } from "@/modules/projects/store/projects";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface StatusTabsProps {
  onTabChange: (tab: ProjectFilterTab) => void;
  activeTab: ProjectFilterTab;
  /**
   * Optional per-tab counts. When a count is provided for a tab, a small
   * pill is rendered next to the label.
   */
  counts?: Partial<Record<ProjectFilterTab, number>>;
}

const TAB_DOT_CLASS: Record<ProjectFilterTab, string> = {
  all: "bg-muted-foreground/40",
  Pending: "pm-dot-project-pending",
  Running: "pm-dot-project-running",
  Stopped: "pm-dot-project-stopped",
  Completed: "pm-dot-project-completed",
};

const TAB_LABEL_KEY: Record<ProjectFilterTab, string> = {
  all: "all",
  Pending: "pending",
  Running: "running",
  Stopped: "stopped",
  Completed: "completed",
};

const TABS: ProjectFilterTab[] = [
  "all",
  "Pending",
  "Running",
  "Stopped",
  "Completed",
];

const ProjectStatusTabs: React.FC<StatusTabsProps> = ({
  onTabChange,
  activeTab,
  counts,
}) => {
  const t = useTranslations("modules.projects.list.tabs");

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={(value) => onTabChange(value as ProjectFilterTab)}
      value={activeTab}
    >
      <TabsList>
        {TABS.map((tab) => {
          const count = counts?.[tab];
          return (
            <TabsTrigger key={tab} value={tab} className="gap-1.5">
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  TAB_DOT_CLASS[tab],
                )}
              />
              <span>{t(TAB_LABEL_KEY[tab])}</span>
              {typeof count === "number" ? (
                <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {count}
                </span>
              ) : null}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default ProjectStatusTabs;
