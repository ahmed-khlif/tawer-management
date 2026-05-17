"use client";
import React from "react";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  Trash2,
  PlusCircle,
  Check,
  Layers,
  User,
  ScanSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { useTranslations } from "next-intl";
import * as Kanban from "@/components/ui/kanban";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { ProjectMember } from "@/modules/projects/types/projects";
import { projectTaskStatusDotColors } from "../../../utils/badges/project-task-badges";
import ProjectTasksKanbanCard from "./project-tasks-kanban-card";

interface SwimlaneDefinition {
  id: string;
  title: string;
  subtitle?: string;
  color?: string | null;
  taskCount: number;
  columns: Array<{ key: string; title: string }>;
}

interface ActiveSprintSummary {
  id: string;
  name: string;
  status: string;
  dateLabel: string;
  progressPercent: number;
  completedTasks: number;
  totalTasks: number;
  teamMembers: Array<{
    id: string;
    name: string;
    image?: string | null;
  }>;
}

interface Props {
  projectType: string;
  groupBy?: "none" | "assignee" | "epic";
  columns: Record<string, ProjectTaskType[]>;
  columnTitles: Record<string, string>;
  activeSprint?: ActiveSprintSummary | null;
  swimlanes?: SwimlaneDefinition[];
  members?: ProjectMember[];
  customStatusColorByKey?: Record<string, string>;
  customStatusColorByName?: Record<string, string>;
  totalTasks?: number;
  canMoveTask?: (task: ProjectTaskType) => boolean;
  canDuplicateTask?: (task: ProjectTaskType) => boolean;
  canManageColumns?: boolean;
  onValueChange: (cols: Record<string, ProjectTaskType[]>) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onTaskClick: (task: ProjectTaskType) => void;
  onDuplicateTask: (task: ProjectTaskType, e: React.MouseEvent) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddColumn: (title: string) => void;
}

function KanbanColumnCard({
  columnValue,
  columnTitle,
  columnTasks,
  projectType,
  members,
  customStatusColorByKey,
  customStatusColorByName,
  canMoveTask,
  canDuplicateTask,
  canManageColumns,
  onTaskClick,
  onDuplicateTask,
  onDeleteColumn,
  showColumnControls = true,
}: {
  columnValue: string;
  columnTitle: string;
  columnTasks: ProjectTaskType[];
  projectType: string;
  members?: ProjectMember[];
  customStatusColorByKey?: Record<string, string>;
  customStatusColorByName?: Record<string, string>;
  canMoveTask?: (task: ProjectTaskType) => boolean;
  canDuplicateTask?: (task: ProjectTaskType) => boolean;
  canManageColumns?: boolean;
  onTaskClick: (task: ProjectTaskType) => void;
  onDuplicateTask: (task: ProjectTaskType, e: React.MouseEvent) => void;
  onDeleteColumn: (columnId: string) => void;
  showColumnControls?: boolean;
}) {
  const tTasks = useTranslations("modules.projects.tasks");
  const defaultDot = projectTaskStatusDotColors[columnValue];
  const customDotHex = customStatusColorByKey?.[columnValue];

  return (
    <Kanban.Column
      value={columnValue}
      className="w-[320px] min-w-[320px] rounded-2xl border border-border/70 bg-background/60 p-3 shadow-sm backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 -mx-1 -mt-1 flex items-center justify-between gap-3 rounded-xl bg-background/95 px-1 py-1.5 backdrop-blur-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {defaultDot ? (
              <span className={cn("size-2 rounded-full", defaultDot)} />
            ) : customDotHex ? (
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: customDotHex }}
              />
            ) : null}
            <span className="truncate text-sm font-semibold">{columnTitle}</span>
            <Badge
              variant="outline"
              className="border-border/70 bg-background/80 text-[10px] font-semibold"
            >
              {columnTasks.length}
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {columnTasks.length === 0
              ? tTasks("kanban.readyForWork", {
                  defaultValue: "Ready for work",
                })
              : tTasks("kanban.cardsInColumn", {
                  defaultValue: "{count} cards in this column",
                }).replace("{count}", String(columnTasks.length))}
          </p>
        </div>
        {showColumnControls ? (
          <div className="flex shrink-0">
            <Kanban.ColumnHandle asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <GripVertical className="size-4" />
              </Button>
            </Kanban.ColumnHandle>
            {canManageColumns ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteColumn(columnValue)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete column</p>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex min-h-[420px] flex-1 flex-col rounded-xl border border-border/60 bg-muted/20 p-2.5">
        {columnTasks.length > 0 ? (
          <div className="flex flex-col gap-2">
            {columnTasks.map((task) => {
              const canMove = canMoveTask ? canMoveTask(task) : true;
              const canDuplicate = canDuplicateTask ? canDuplicateTask(task) : false;
              return (
                <Kanban.Item key={task.id} value={task.id} disabled={!canMove} asChild>
                  <div>
                    <ProjectTasksKanbanCard
                      task={task}
                      projectType={projectType}
                      members={members}
                      customStatusColorByName={customStatusColorByName}
                      onClick={() => onTaskClick(task)}
                      onDuplicate={canDuplicate ? (e) => onDuplicateTask(task, e) : undefined}
                    />
                  </div>
                </Kanban.Item>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/55 px-4 py-8 text-center">
            <ScanSearch className="size-5 text-muted-foreground/70" />
            <p className="text-xs text-muted-foreground">{tTasks("kanban.noTasks")}</p>
          </div>
        )}
      </div>
    </Kanban.Column>
  );
}

export default function ProjectTasksKanbanBoard({
  projectType,
  groupBy = "none",
  columns,
  columnTitles,
  activeSprint,
  swimlanes,
  members,
  customStatusColorByKey,
  customStatusColorByName,
  totalTasks,
  canMoveTask,
  canDuplicateTask,
  canManageColumns,
  onValueChange,
  onDragStart,
  onDragEnd,
  onTaskClick,
  onDuplicateTask,
  onDeleteColumn,
  onAddColumn,
}: Props) {
  const tTasks = useTranslations("modules.projects.tasks");
  const [isAddColumnOpen, setIsAddColumnOpen] = React.useState(false);
  const [newColumnTitle, setNewColumnTitle] = React.useState("");
  const [columnToDelete, setColumnToDelete] = React.useState<string | null>(null);

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    onAddColumn(newColumnTitle.trim());
    setNewColumnTitle("");
    setIsAddColumnOpen(false);
  };

  const totalColumnCount = React.useMemo(() => Object.keys(columns).length, [columns]);
  const totalLaneCount = React.useMemo(() => (swimlanes ?? []).length, [swimlanes]);

  const renderPlainBoard = () => (
    <Kanban.Board className="flex w-full gap-5 overflow-x-auto pb-4">
      {Object.entries(columns).map(([columnValue, columnTasks]) => (
        <KanbanColumnCard
          key={columnValue}
          columnValue={columnValue}
          columnTitle={columnTitles[columnValue] || columnValue.toLowerCase().replace(/_/g, " ")}
          columnTasks={columnTasks}
          projectType={projectType}
          members={members}
          customStatusColorByKey={customStatusColorByKey}
          customStatusColorByName={customStatusColorByName}
          canMoveTask={canMoveTask}
          canDuplicateTask={canDuplicateTask}
          canManageColumns={canManageColumns}
          onTaskClick={onTaskClick}
          onDuplicateTask={onDuplicateTask}
          onDeleteColumn={(columnId) => setColumnToDelete(columnId)}
        />
      ))}

      {canManageColumns ? (
        <div className="w-[300px] min-w-[300px]">
          <Card
            className="flex h-full min-h-[180px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-primary/25 bg-background/50 transition-colors hover:bg-muted/50"
            onClick={() => setIsAddColumnOpen(true)}
          >
            <CardContent className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <PlusCircle className="size-5" />
              <span className="text-sm">{tTasks("kanban.addColumn")}</span>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </Kanban.Board>
  );

  const renderSwimlanes = () => (
    <Kanban.Board className="flex w-full flex-col gap-5 pb-4">
      {(swimlanes ?? []).map((lane) => (
        <section
          key={lane.id}
          className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm"
        >
          <div
            className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3"
            style={{
              borderLeftColor: lane.color ?? "#6366F1",
              borderLeftWidth: 4,
            }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {groupBy === "epic" ? (
                  <Layers className="size-4 text-muted-foreground" />
                ) : (
                  <User className="size-4 text-muted-foreground" />
                )}
                <h3 className="truncate text-sm font-semibold">{lane.title}</h3>
                <Badge variant="outline" className="text-[10px]">
                  {lane.taskCount}
                </Badge>
              </div>
              {lane.subtitle ? (
                <p className="text-xs text-muted-foreground">{lane.subtitle}</p>
              ) : null}
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto p-4">
            {lane.columns.map((column) => (
              <KanbanColumnCard
                key={column.key}
                columnValue={column.key}
                columnTitle={column.title}
                columnTasks={columns[column.key] ?? []}
                projectType={projectType}
                members={members}
                customStatusColorByKey={customStatusColorByKey}
                customStatusColorByName={customStatusColorByName}
                canMoveTask={canMoveTask}
                canDuplicateTask={canDuplicateTask}
                canManageColumns={false}
                onTaskClick={onTaskClick}
                onDuplicateTask={onDuplicateTask}
                onDeleteColumn={() => {}}
                showColumnControls={false}
              />
            ))}
          </div>
        </section>
      ))}
    </Kanban.Board>
  );

  return (
    <>
      {activeSprint ? (
        <div className="mb-4 rounded-2xl border border-border/70 bg-card/85 px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-semibold">{activeSprint.name}</h3>
                <Badge variant="outline" className="text-[10px]">
                  {activeSprint.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{activeSprint.dateLabel}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {activeSprint.completedTasks}/{activeSprint.totalTasks} tasks complete
                    </span>
                    <span>{activeSprint.progressPercent}%</span>
                  </div>
                  <Progress value={activeSprint.progressPercent} className="h-1.5 bg-muted/50" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {activeSprint.teamMembers.map((member) => {
                  const initials = member.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <Tooltip key={member.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="size-8 border-2 border-background shadow-sm">
                          {member.image ? <AvatarImage src={member.image} alt={member.name} /> : null}
                          <AvatarFallback className="text-[10px] font-semibold">
                            {initials || "TM"}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{member.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
              <span className="text-xs text-muted-foreground">
                {activeSprint.teamMembers.length} team member
                {activeSprint.teamMembers.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm">
        <Badge
          variant="outline"
          className="border-primary/20 bg-primary/10 text-[11px] font-semibold text-primary"
        >
          {groupBy === "none"
            ? "Status-first Kanban"
            : groupBy === "epic"
              ? "Epic swimlanes"
              : "Assignee swimlanes"}
        </Badge>
        <Badge variant="outline" className="text-[11px]">
          {groupBy === "none" ? `${totalColumnCount} columns` : `${totalLaneCount} swimlanes`}
        </Badge>
        <Badge variant="outline" className="text-[11px]">
          {totalTasks ?? 0} visible tasks
        </Badge>
      </div>

      <Kanban.Root
        value={columns}
        onValueChange={onValueChange}
        getItemValue={(item) => item.id}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragEnd}
      >
        <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-primary/5 p-4 shadow-sm">
          {groupBy === "none" ? renderPlainBoard() : renderSwimlanes()}
        </div>

        <Kanban.Overlay>
          <div className="bg-primary/10 size-full rounded-md" />
        </Kanban.Overlay>
      </Kanban.Root>

      <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{tTasks("kanban.addColumn")}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex gap-2">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder={tTasks("kanban.enterColumnName")}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddColumn();
              }}
            />
            <Button size="icon" disabled={!newColumnTitle.trim()} onClick={handleAddColumn}>
              <Check className="size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!columnToDelete}
        onOpenChange={(open) => !open && setColumnToDelete(null)}
        title={tTasks("kanban.deleteColumn")}
        description={tTasks("kanban.deleteColumnConfirm")}
        onConfirm={() => {
          if (columnToDelete) {
            onDeleteColumn(columnToDelete);
            setColumnToDelete(null);
          }
        }}
        onCancel={() => setColumnToDelete(null)}
        confirmLabel={tTasks("kanban.confirm")}
        cancelLabel={tTasks("kanban.cancel")}
      />
    </>
  );
}
