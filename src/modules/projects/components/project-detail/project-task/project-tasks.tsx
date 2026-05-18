"use client";
import React from "react";
import ProjectTasksList from "./project-tasks-list";
import { ProjectType } from "../../../types/projects";

interface Props {
  project: ProjectType;
  forcedViewMode?: "list" | "grid";
}

export default function ProjectTasks({ project, forcedViewMode }: Props) {
  return <ProjectTasksList project={project} forcedViewMode={forcedViewMode} />;
}
