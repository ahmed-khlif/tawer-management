import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProjectEpic,
  deleteProjectEpic,
  updateProjectEpic,
} from "@/modules/projects/services/api/project-epics";
import { projectQueryKeys } from "@/modules/projects/query-keys";
import { CreateEpicDto, Epic, UpdateEpicDto } from "@/modules/projects/types/project-epics";

function toastApiError(prefix: string, err: unknown) {
  const ax = err as { response?: { data?: { message?: unknown } } };
  const msg = ax?.response?.data?.message;
  toast.error(typeof msg === "string" && msg.trim() ? msg : prefix);
}

function pickAiResponse(epic: Epic) {
  if (!epic) return null;
  if (
    epic.aiRiskLevel ||
    (epic.aiRecommendations && epic.aiRecommendations.length > 0) ||
    epic.aiTimelineSuggestion
  ) {
    return {
      id: epic.id,
      aiRiskLevel: epic.aiRiskLevel,
      aiRecommendations: epic.aiRecommendations,
      aiTimelineSuggestion: epic.aiTimelineSuggestion,
    };
  }
  return null;
}

export function useEpicUpload(projectId: string) {
  const queryClient = useQueryClient();
  const [aiResponse, setAiResponse] = useState<ReturnType<typeof pickAiResponse>>(null);

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["project-epics", projectId],
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateEpicDto) => createProjectEpic(projectId, data),
    onSuccess: async (epic) => {
      await invalidate();
      setAiResponse(pickAiResponse(epic));
      toast.success("Epic created successfully.");
    },
    onError: (err) => toastApiError("Failed to create epic.", err),
  });

  const updateMutation = useMutation({
    mutationFn: ({ epicId, data }: { epicId: string; data: UpdateEpicDto }) =>
      updateProjectEpic(projectId, epicId, data),
    onSuccess: async (epic, variables) => {
      await invalidate();
      await queryClient.invalidateQueries({
        queryKey: projectQueryKeys.epics.detail(projectId, variables.epicId),
      });
      setAiResponse(pickAiResponse(epic));
      toast.success("Epic updated successfully.");
    },
    onError: (err) => toastApiError("Failed to update epic.", err),
  });

  const deleteMutation = useMutation({
    mutationFn: (epicId: string) => deleteProjectEpic(projectId, epicId),
    onSuccess: async () => {
      await invalidate();
      toast.success("Epic deleted successfully.");
    },
    onError: () => toast.error("Failed to delete epic."),
  });

  return {
    createEpic: createMutation,
    updateEpic: updateMutation,
    deleteEpic: deleteMutation,
    aiResponse,
    clearAiResponse: () => setAiResponse(null),
  };
}

export default useEpicUpload;
