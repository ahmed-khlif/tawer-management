"use client";

import { CheckCircle2, ListTodo, Calendar, AlertTriangle, Layers, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { Epic } from "@/modules/projects/types/project-epics";

interface EpicCardProps {
  epic: Epic;
  permissions: ProjectPermissions;
  viewMode?: "grid" | "list";
  onOpen: (epic: Epic) => void;
  onEdit: (epic: Epic) => void;
  onDelete: (epic: Epic) => void;
}

const formatDate = (value?: string | null) =>
  value ? format(new Date(value), "MMM d, yyyy") : "No date";

export default function EpicCard({
  epic,
  permissions,
  viewMode = "grid",
  onOpen,
  onEdit,
  onDelete,
}: EpicCardProps) {
  const isCompleted = epic.totalTasks > 0 && epic.doneTasks >= epic.totalTasks;

  if (viewMode === "grid") {
    return (
      <Card
        className={cn(
          "group relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-border/50 overflow-hidden",
          isCompleted && "bg-emerald-500/[0.02]"
        )}
        onClick={() => onOpen(epic)}
      >
        {epic.color ? (
          <div
            className="h-1 w-full"
            style={{ backgroundColor: epic.color }}
          />
        ) : (
          <div className="h-1 w-full bg-primary/20" />
        )}
        
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                {epic.name}
              </h3>
              <p className="line-clamp-2 text-xs text-muted-foreground/80 leading-relaxed">
                {epic.description || "No description provided."}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "h-5 text-[10px] uppercase font-bold tracking-wider px-2",
                isCompleted
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-primary/10 text-primary border-primary/20"
              )}
            >
              {isCompleted ? "Done" : "In Progress"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>{formatDate(epic.startDate)} - {formatDate(epic.endDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ListTodo className="size-3.5" />
                <span>
                  {epic.doneTasks}/{epic.totalTasks}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <Progress 
                value={epic.progress} 
                className={cn("h-1.5", isCompleted && "bg-emerald-500/20")}
              />
              <div className="flex justify-end">
                <span className="text-[10px] font-bold text-muted-foreground">
                  {Math.round(epic.progress)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-auto">
            <div className="flex items-center gap-2">
              {epic.aiRiskLevel && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "size-2 rounded-full",
                      epic.aiRiskLevel === "HIGH" ? "bg-destructive" :
                      epic.aiRiskLevel === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500"
                    )} />
                  </TooltipTrigger>
                  <TooltipContent>AI Risk: {epic.aiRiskLevel}</TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <PermissionGuard allowed={permissions.canEditEpic}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(epic);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
              </PermissionGuard>
              <PermissionGuard allowed={permissions.canDeleteEpic}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(epic);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-200 hover:shadow-md border-border/50",
        isCompleted && "bg-muted/30"
      )}
      onClick={() => onOpen(epic)}
    >
      <CardContent className="flex items-center gap-6 py-3 px-4">
        {/* Color Strip Indicator */}
        <div 
          className="w-1.5 h-10 rounded-full shrink-0"
          style={{ backgroundColor: epic.color || "var(--primary)" }}
        />

        {/* Content */}
        <div className="flex grow flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold leading-none truncate group-hover:text-primary transition-colors">
              {epic.name}
            </h3>
            {isCompleted && (
              <Badge variant="outline" className="h-4 text-[9px] uppercase px-1.5 font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Completed
              </Badge>
            )}
          </div>
          <p className="line-clamp-1 text-[11px] text-muted-foreground/70">
            {epic.description || "No description provided."}
          </p>
        </div>

        {/* Metadata Columns */}
        <div className="hidden md:flex items-center gap-8 px-4 border-l border-r border-border/40 h-8">
          <div className="flex flex-col gap-0.5 min-w-[120px]">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
              Timeline
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>{formatDate(epic.startDate)} - {formatDate(epic.endDate)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 min-w-[80px]">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
              Tasks
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <ListTodo className="size-3.5 text-muted-foreground" />
              <span>{epic.doneTasks}/{epic.totalTasks}</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-1.5 w-32 shrink-0">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            <span>Progress</span>
            <span className="text-foreground">{Math.round(epic.progress)}%</span>
          </div>
          <Progress 
            value={epic.progress} 
            className={cn(
              "h-1.5",
              isCompleted ? "bg-emerald-500/20" : ""
            )} 
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <div className="flex items-center gap-1 opacity-0 transition-all duration-200 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
            <PermissionGuard allowed={permissions.canEditEpic}>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(epic);
                }}
              >
                <Pencil className="size-4" />
              </Button>
            </PermissionGuard>
            <PermissionGuard allowed={permissions.canDeleteEpic}>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(epic);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </PermissionGuard>
          </div>
          <div className="size-8 flex items-center justify-center group-hover:hidden transition-all">
            <Layers className={cn(
              "size-4",
              isCompleted ? "text-emerald-500" : "text-muted-foreground/30"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
