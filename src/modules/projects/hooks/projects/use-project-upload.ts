import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectSchema, ProjectFormValues } from "../../validation/project.schema";
import { uploadProject, archiveProject, restoreProject } from "../../services";
import {
  ProjectType,
  CreateProjectPayload,
  CreatedProjectAiResponse,
  UpdateProjectPayload,
  ProjectContentPayload,
} from "../../types/projects";
import type { ProjectTemplatePreset } from "../../types/project-template-presets";

function buildDefaults(
  project?: ProjectType | null,
  templatePreset?: ProjectTemplatePreset | null,
): ProjectFormValues {
  const start = new Date(); start.setMinutes(0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 7);
  const template = !project ? templatePreset : null;

  return {
    name: project?.name ?? template?.defaultName ?? "",
    description: project?.description ?? template?.defaultDescription ?? "",
    details: project?.contents?.[0]?.details ?? template?.defaultDetails ?? "",
    language: project?.contents?.[0]?.language ?? undefined,
    businessUnit: project?.businessUnit ?? template?.businessUnit ?? "TawerDev",
    projectType: project?.projectType ?? template?.projectType ?? "AGILE",
    status: project?.status ?? "Pending",
    startDate: project?.startTime ? new Date(project.startTime).toISOString() : start.toISOString(),
    endDate: project?.endTime ? new Date(project.endTime).toISOString() : end.toISOString(),
    estimatedStartDate: project?.estimatedStartDate ? new Date(project.estimatedStartDate).toISOString() : undefined,
    estimatedEndDate: project?.estimatedEndDate ? new Date(project.estimatedEndDate).toISOString() : undefined,
    paid: project?.paid ?? false,
    isArchived: project?.isArchived ?? false,
    displayOrder: project?.displayOrder ?? 0,
    manager: project?.members?.find(m => m.isManager)?.userId ?? "",
    aiSuggestRoadmap: false,
  };
}

interface Params {
  project?: ProjectType | null;
  templatePreset?: ProjectTemplatePreset | null;
  onSuccess?: (aiResponse?: CreatedProjectAiResponse) => void;
}

export default function useProjectUpload({ project, templatePreset, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [aiResponse, setAiResponse] = useState<CreatedProjectAiResponse | null>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: buildDefaults(project, templatePreset),
  });

  // Re-sync form whenever the project prop changes (sheet opens for a different project)
  useEffect(() => {
    form.reset(buildDefaults(project, templatePreset));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, templatePreset?.id]);

  async function onSubmit(data: ProjectFormValues) {
    setIsPending(true);
    setError("");
    try {
      if (project?.id) {
        // Update — businessUnit and projectType are immutable
        const existingContent = project.contents?.[0];

        // Handle archive/restore via dedicated endpoints — only call if state actually changed
        const archivedChanged = data.isArchived !== project.isArchived;
        if (archivedChanged) {
          data.isArchived ? await archiveProject(project.id) : await restoreProject(project.id);
        }

        // PATCH everything else (strip isArchived — backend manages it via /archive and /restore)
        const payload: UpdateProjectPayload = {
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          estimatedStartDate: data.estimatedStartDate,
          estimatedEndDate: data.estimatedEndDate,
          paid: data.paid,
          displayOrder: data.displayOrder,
          contents: [{
            id: existingContent?.id,
            name: data.name,
            description: data.description,
            details: data.details,
            language: data.language || undefined,
          } as ProjectContentPayload],
        };
        await uploadProject(payload, project.id);
      } else {
        // Create — requires nested contents + members + manager
        const userId = data.manager || "";
        const payload: CreateProjectPayload = {
          businessUnit: data.businessUnit!,
          projectType: data.projectType,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          estimatedStartDate: data.estimatedStartDate,
          estimatedEndDate: data.estimatedEndDate,
          paid: data.paid,
          displayOrder: data.displayOrder,
          manager: userId,
          members: [{ userId, isManager: true }],
          contents: [{
            name: data.name,
            description: data.description,
            details: data.details,
            language: data.language || undefined,
          } as ProjectContentPayload],
          aiSuggestRoadmap: data.aiSuggestRoadmap,
        };
        const response = await uploadProject(payload);
        setAiResponse(response ?? null);
        toast.success("Project created");
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        onSuccess?.(response ?? undefined);
        return;
      }

      toast.success("Project updated");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return { form, isPending, onSubmit, error, aiResponse, clearAiResponse: () => setAiResponse(null) };
}
