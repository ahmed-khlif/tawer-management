"use client";
import React from "react";
import { dateToString } from "@/utils/date";
import { useTranslations } from "next-intl";
import {
  Briefcase,
  Settings,
  Calendar,
  CreditCard,
  Archive,
  LayoutTemplate,
  AlignLeft,
  CircleDot,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ProjectType } from "../../../types/projects";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  businessUnitClasses,
  businessUnitFallbackClasses,
  businessUnitNamed,
  projectStatusClasses,
  projectTypeClasses,
} from "../../../utils/badges/project-badges";

interface Props {
  project: ProjectType;
}

export default function ProjectSettings({ project }: Props) {
  const t = useTranslations("modules.projects.project.details.settings");

  // name and description are mapped from contents[0] during casting
  const projectName = project.name;
  const projectDesc = project.description || t("noDescription");

  const typeBadge =
    projectTypeClasses[project.projectType] ?? projectTypeClasses.AGILE;
  const statusBadge =
    projectStatusClasses[project.status] ?? projectStatusClasses.Pending;
  const buBadge = project.businessUnit
    ? businessUnitClasses[project.businessUnit] ?? businessUnitFallbackClasses
    : businessUnitFallbackClasses;
  const buDisplay = project.businessUnit
    ? businessUnitNamed[project.businessUnit] ?? project.businessUnit
    : "—";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* General Information */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Settings className="size-4" />
              </span>
              {t("general")}
            </CardTitle>
            <CardDescription>
              {t("generalHint", {
                defaultValue:
                  "Core identity for this workspace — name, description, business unit and methodology.",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
             <div className="space-y-1.5">
               <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                 <AlignLeft className="size-3.5"/> {t("name")}
               </Label>
               <p className="text-sm font-medium leading-relaxed">{projectName}</p>
             </div>
             
             <div className="space-y-1.5">
               <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                 <AlignLeft className="size-3.5"/> {t("desc")}
               </Label>
               <p className="text-sm leading-relaxed">{projectDesc}</p>
             </div>

             <div className="space-y-1.5">
               <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                 <Briefcase className="size-3.5"/> {t("businessUnit")}
               </Label>
               <div className="flex items-center gap-2">
                 <Badge variant="outline" className={cn("text-xs", buBadge)}>
                   {buDisplay}
                 </Badge>
               </div>
             </div>

             <div className="space-y-1.5">
               <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                 <LayoutTemplate className="size-3.5"/> {t("type")}
               </Label>
               <div className="mt-1">
                 <Badge variant="outline" className={cn("font-mono text-xs", typeBadge)}>
                   {project.projectType}
                 </Badge>
               </div>
             </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Status & Payment */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <CircleDot className="size-4" />
                </span>
                {t("status")}
              </CardTitle>
              <CardDescription>
                {t("statusHint", {
                  defaultValue:
                    "Billing, archive state and high-level lifecycle for this project.",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="size-4 text-muted-foreground" />
                  <span>{t("paid")}</span>
                </div>
                <Badge variant={project.paid ? "default" : "secondary"}>
                  {project.paid ? t("yes") : t("no")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Archive className="size-4 text-muted-foreground" />
                  <span>{t("archived")}</span>
                </div>
                <Badge variant={project.isArchived ? "destructive" : "secondary"}>
                  {project.isArchived ? t("yes") : t("no")}
                </Badge>
              </div>
              <div className="mt-1 flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("lifecycleStatus")}
                </span>
                <Badge variant="outline" className={cn("text-xs capitalize", statusBadge)}>
                  {project.status.toLowerCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Calendar className="size-4" />
                </span>
                {t("timeline")}
              </CardTitle>
              <CardDescription>
                {t("timelineHint", {
                  defaultValue:
                    "Planned start and end — used for scheduling and time-based progress.",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">{t("startDate")}</span>
                <span className="font-semibold">{dateToString(project.startTime)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">{t("endDate")}</span>
                <span className="font-semibold">{dateToString(project.endTime)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
