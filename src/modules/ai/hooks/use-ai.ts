import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchAiProjectMetrics,
  fetchProjectAnomalies,
  fetchSmartAssignment,
  predictTaskDuration,
  submitPredictionOutcomeFeedback,
} from "@/modules/ai/services/ai";
import {
  PredictTaskDurationDto,
  PredictionOutcomeFeedbackDto,
  SmartAssignmentDto,
} from "@/modules/ai/types";

export function useTaskDurationPrediction() {
  return useMutation({
    mutationFn: (data: PredictTaskDurationDto) => predictTaskDuration(data),
  });
}

export function useSmartAssignment() {
  return useMutation({
    mutationFn: (data: SmartAssignmentDto) => fetchSmartAssignment(data),
  });
}

export function usePredictionOutcomeFeedback() {
  return useMutation({
    mutationFn: (data: PredictionOutcomeFeedbackDto) =>
      submitPredictionOutcomeFeedback(data),
  });
}

export function useAiProjectMetrics(projectId?: string | null) {
  return useQuery({
    queryKey: ["ai-project-metrics", projectId],
    queryFn: () => fetchAiProjectMetrics(projectId!),
    enabled: !!projectId,
    staleTime: 300_000,
  });
}

export function useProjectAnomalies(projectId?: string | null) {
  return useQuery({
    queryKey: ["ai-project-anomalies", projectId],
    queryFn: () => fetchProjectAnomalies(projectId!),
    enabled: !!projectId,
    staleTime: 300_000,
  });
}
