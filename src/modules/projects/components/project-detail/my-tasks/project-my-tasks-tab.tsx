"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import useMyTasksInProject from "@/modules/projects/hooks/tasks/use-my-tasks-in-project";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";
import {
  EnumProjectTaskPriority,
  EnumProjectTaskStatus,
  EnumProjectTaskType,
  ProjectTaskType,
} from "@/modules/projects/types/project-tasks";
import { ProjectType } from "@/modules/projects/types/projects";
import ProjectTaskItem from "../project-task/project-task-item";
import ProjectTaskDetailSheet from "../project-task/project-task-details-sheet";

const PAGE_SIZE = 20;

interface Props {
  project: ProjectType;
}

/**
 * Project-scoped "My tasks" view backed by
 * `GET /projects/:projectId/tasks/me`. Reuses the project-level task UI for
 * consistency.
 */
export default function ProjectMyTasksTab({ project }: Props) {
  const t = useTranslations("modules.projects.tasks");

  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const [priority, setPriority] = React.useState<string | undefined>(undefined);
  const [type, setType] = React.useState<string | undefined>(undefined);
  const [page, setPage] = React.useState(1);
  const [selectedTask, setSelectedTask] = React.useState<ProjectTaskType | null>(null);

  const queryParams = React.useMemo(
    () => ({ status, priority, type, page, limit: PAGE_SIZE }),
    [status, priority, type, page],
  );
  const { data, isLoading, isError } = useMyTasksInProject(project.id, queryParams);

  const tasks: ProjectTaskType[] = React.useMemo(
    () => (data?.data ?? []).map(castProjectTaskToFrontend),
    [data?.data],
  );

  const totalPages = data?.pagination?.totalPages ?? 1;
  const records = data?.pagination?.records ?? 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("myTasksInProject.title", { defaultValue: "My tasks in this project" })}</span>
            <span className="text-sm text-muted-foreground">
              {t("myTasksInProject.totalRecords", {
                defaultValue: "{count} task(s)",
                count: records,
              })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs uppercase text-muted-foreground">
                {t("filters.status", { defaultValue: "Status" })}
              </label>
              <Select
                value={status ?? "all"}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value === "all" ? undefined : value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("filters.all", { defaultValue: "All" })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all", { defaultValue: "All" })}</SelectItem>
                  {Object.values(EnumProjectTaskStatus).map((statusValue) => (
                    <SelectItem key={statusValue} value={statusValue}>
                      {t(`statusLabels.${statusValue.toLowerCase()}`, {
                        defaultValue: statusValue,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs uppercase text-muted-foreground">
                {t("filters.priority", { defaultValue: "Priority" })}
              </label>
              <Select
                value={priority ?? "all"}
                onValueChange={(value) => {
                  setPage(1);
                  setPriority(value === "all" ? undefined : value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("filters.all", { defaultValue: "All" })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all", { defaultValue: "All" })}</SelectItem>
                  {Object.values(EnumProjectTaskPriority).map((priorityValue) => (
                    <SelectItem key={priorityValue} value={priorityValue}>
                      {t(`priorityLabels.${priorityValue.toLowerCase()}`, {
                        defaultValue: priorityValue,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs uppercase text-muted-foreground">
                {t("filters.type", { defaultValue: "Type" })}
              </label>
              <Select
                value={type ?? "all"}
                onValueChange={(value) => {
                  setPage(1);
                  setType(value === "all" ? undefined : value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("filters.all", { defaultValue: "All" })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all", { defaultValue: "All" })}</SelectItem>
                  {Object.values(EnumProjectTaskType).map((typeValue) => (
                    <SelectItem key={typeValue} value={typeValue}>
                      {t(`types.${typeValue.toLowerCase()}`, { defaultValue: typeValue })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {t("myTasksInProject.errorTitle", { defaultValue: "Couldn't load your tasks" })}
            </EmptyTitle>
            <EmptyDescription>
              {t("myTasksInProject.errorDescription", {
                defaultValue: "Please refresh the page and try again.",
              })}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : tasks.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {t("myTasksInProject.emptyTitle", { defaultValue: "Nothing assigned to you" })}
            </EmptyTitle>
            <EmptyDescription>
              {t("myTasksInProject.emptyDescription", {
                defaultValue: "You have no tasks in this project for the selected filters.",
              })}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <ProjectTaskItem
              key={task.id}
              task={task}
              projectType={project.projectType}
              viewMode="list"
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </div>
      )}

      {tasks.length > 0 && totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t("pagination.previous", { defaultValue: "Previous" })}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("pagination.page", {
              defaultValue: "Page {page} of {total}",
              page,
              total: totalPages,
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {t("pagination.next", { defaultValue: "Next" })}
          </Button>
        </div>
      ) : null}

      <ProjectTaskDetailSheet
        projectId={project.id}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onEditClick={() => undefined}
      />
    </div>
  );
}
