import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  completeProjectMilestone,
  createProjectMilestone,
  deleteProjectMilestone,
  updateProjectMilestone,
} from "@/modules/projects/services/api/project-milestones";
import { projectQueryKeys } from "@/modules/projects/query-keys";
import {
  CreateMilestoneDto,
  Milestone,
  UpdateMilestoneDto,
} from "@/modules/projects/types/project-milestones";

function pickAiResponse(milestone: Milestone) {
  if (!milestone) return null;
  if (
    milestone.aiRiskLevel ||
    (milestone.aiRecommendations && milestone.aiRecommendations.length > 0) ||
    milestone.aiDueDateSuggestion
  ) {
    return {
      id: milestone.id,
      aiRiskLevel: milestone.aiRiskLevel,
      aiRecommendations: milestone.aiRecommendations,
      aiDueDateSuggestion: milestone.aiDueDateSuggestion,
    };
  }
  return null;
}

export function useMilestoneUpload(projectId: string) {
  const queryClient = useQueryClient();
  const [aiResponse, setAiResponse] = useState<ReturnType<typeof pickAiResponse>>(null);

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["project-milestones", projectId],
    });
    await queryClient.invalidateQueries({
      queryKey: projectQueryKeys.milestones.gantt(projectId),
    });
    await queryClient.invalidateQueries({
      queryKey: ["project-tasks", projectId],
    });
    await queryClient.invalidateQueries({
      queryKey: projectQueryKeys.tasks.kanban(projectId),
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateMilestoneDto) =>
      createProjectMilestone(projectId, data),
    onSuccess: async (milestone) => {
      await invalidate();
      setAiResponse(pickAiResponse(milestone));
      toast.success("Milestone created successfully.");
    },
    onError: () => toast.error("Failed to create milestone."),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      milestoneId,
      data,
    }: {
      milestoneId: string;
      data: UpdateMilestoneDto;
    }) => updateProjectMilestone(projectId, milestoneId, data),
    onSuccess: async (milestone, variables) => {
      await invalidate();
      await queryClient.invalidateQueries({
        queryKey: projectQueryKeys.milestones.detail(projectId, variables.milestoneId),
      });
      setAiResponse(pickAiResponse(milestone));
      toast.success("Milestone updated successfully.");
    },
    onError: () => toast.error("Failed to update milestone."),
  });

  const completeMutation = useMutation({
    mutationFn: (milestoneId: string) => completeProjectMilestone(projectId, milestoneId),
    onSuccess: async () => {
      await invalidate();
      toast.success("Milestone marked as complete.");
    },
    onError: () => toast.error("Failed to complete milestone."),
  });

  const deleteMutation = useMutation({
    mutationFn: (milestoneId: string) => deleteProjectMilestone(projectId, milestoneId),
    onSuccess: async () => {
      await invalidate();
      toast.success("Milestone deleted successfully.");
    },
    onError: () => toast.error("Failed to delete milestone."),
  });

  return {
    createMilestone: createMutation,
    updateMilestone: updateMutation,
    completeMilestone: completeMutation,
    deleteMilestone: deleteMutation,
    aiResponse,
    clearAiResponse: () => setAiResponse(null),
  };
}

export default useMilestoneUpload;
