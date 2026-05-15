import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getProjectTaskFormSchema, ProjectTaskFormSchema } from "../../validation/project-task.schema";
import { uploadProjectTask, ProjectTaskPayload } from "../../services";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { AiBlockerRisk } from "@/modules/ai/types";

interface Params {
  projectId: string;
  task?: ProjectTaskType | null;
  onSuccess?: (aiBlockerRisk?: AiBlockerRisk) => void;
}

export default function useProjectTaskUpload({ projectId, task, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const t = useTranslations("modules.projects.project.taskAttributes");

  const schema = getProjectTaskFormSchema({ 
    t: (key: string) => t(`validations.${key}`)
  });

  const form = useForm<ProjectTaskFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      type: (task?.type as any) || "TASK",
      status: (task?.status as any) || "TODO",
      priority: (task?.priority as any) || "MEDIUM",
      storyPoints: task?.storyPoints || 0,
      estimatedHours: task?.estimatedHours || 0,
      dueDate: task?.dueDate || "",
      assigneeId: task?.assigneeId || "",
      milestoneId: task?.milestoneId || "",
      epicId: task?.epicId || "",
      sprintId: task?.sprintId || "",
      parentTaskId: task?.parentTaskId || "",
      aiSuggestAssignee: false,
      aiSuggestEstimate: false,
      aiSuggestBlockerRisk: false,
    }
  });

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        type: (task.type as any) || "TASK",
        status: (task.status as any) || "TODO",
        priority: (task.priority as any) || "MEDIUM",
        storyPoints: task.storyPoints || 0,
        estimatedHours: task.estimatedHours || 0,
        dueDate: task.dueDate || "",
        assigneeId: task.assigneeId || "",
        milestoneId: task.milestoneId || "",
        epicId: task.epicId || "",
        sprintId: task.sprintId || "",
        parentTaskId: task.parentTaskId || "",
        aiSuggestAssignee: false,
        aiSuggestEstimate: false,
        aiSuggestBlockerRisk: false,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        type: "TASK",
        status: "TODO",
        priority: "MEDIUM",
        storyPoints: 0,
        estimatedHours: 0,
        dueDate: "",
        assigneeId: "",
        milestoneId: "",
        epicId: "",
        sprintId: "",
        parentTaskId: "",
        aiSuggestAssignee: false,
        aiSuggestEstimate: false,
        aiSuggestBlockerRisk: false,
      });
    }
  }, [task, form]);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [aiBlockerRisk, setAiBlockerRisk] = useState<AiBlockerRisk | null>(null);

  async function onSubmit(data: ProjectTaskFormSchema) {
    setIsPending(true);
    if (error) setError("");

    try {
      const payload: ProjectTaskPayload = {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        priority: data.priority,
        storyPoints: data.storyPoints,
        dueDate: data.dueDate,
        estimatedHours: data.estimatedHours,
        assigneeId: data.assigneeId || undefined,
        milestoneId: data.milestoneId || undefined,
        epicId: data.epicId || undefined,
        sprintId: data.sprintId || undefined,
        parentTaskId: data.parentTaskId || undefined,
        aiSuggestAssignee: data.aiSuggestAssignee,
        aiSuggestEstimate: data.aiSuggestEstimate,
        aiSuggestBlockerRisk: data.aiSuggestBlockerRisk,
      };

      const result = await uploadProjectTask({
        task: payload,
        id: task?.id,
        projectId,
        attachments: data.attachments,
        deletedAttachments: data.deletedAttachments,
      });

      const responseRisk = (result?.aiBlockerRisk ?? null) as AiBlockerRisk | null;
      if (responseRisk) {
        setAiBlockerRisk(responseRisk);
        if (responseRisk.level === "HIGH") {
          toast.warning(
            `AI flagged this task as HIGH blocker risk: ${responseRisk.flags?.join(", ") || "review dependencies"}`,
          );
        } else if (responseRisk.level === "MEDIUM") {
          toast.message(
            `AI flagged this task as MEDIUM blocker risk: ${responseRisk.flags?.join(", ") || "monitor blockers"}`,
          );
        }
      } else {
        setAiBlockerRisk(null);
      }

      toast.success(task?.id ? "Project task updated" : "Project task created");

      form.reset();
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-backlog", projectId] });

      onSuccess?.(responseRisk ?? undefined);
    } catch (err) {
      toast.error("Failed to save project task");
      setError("An error occurred while saving the task.");
    } finally {
      setIsPending(false);
    }
  }

  return {
    form,
    error,
    isPending,
    onSubmit,
    aiBlockerRisk,
    clearAiBlockerRisk: () => setAiBlockerRisk(null),
  };
}
