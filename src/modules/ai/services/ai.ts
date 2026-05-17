import { GET, POST } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  AiProjectMetrics,
  ImproveDescriptionDto,
  ImproveDescriptionResult,
  PredictionOutcomeFeedbackDto,
  PredictionOutcomeFeedbackResult,
  PredictionResult,
  PredictTaskDurationDto,
  ProjectAnomaliesResult,
  SmartAssignmentDto,
  SmartAssignmentResult,
} from "@/modules/ai/types";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function predictTaskDuration(
  data: PredictTaskDurationDto,
): Promise<PredictionResult> {
  if (isMockMode()) {
    return {
      predictedHours: 8,
      confidence: 0.65,
      reasonCodes: ["MOCK_MODE"],
      riskFlags: ["Mock mode prediction"],
    };
  }

  try {
    const response = await POST(API.AI.PREDICT_TASK_DURATION(), getHeaders(), data);
    return response.data as PredictionResult;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => predictTaskDuration(data))) as PredictionResult;
    }
    throw error;
  }
}

export async function improveDescription(
  data: ImproveDescriptionDto,
): Promise<ImproveDescriptionResult> {
  if (isMockMode()) {
    return {
      improvedDescription: data.description || `Clearer description for ${data.title || "this item"}.`,
      rationale: "Mock-mode rewrite",
    };
  }

  try {
    const response = await POST(API.AI.IMPROVE_DESCRIPTION(), getHeaders(), data);
    return response.data as ImproveDescriptionResult;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => improveDescription(data))) as ImproveDescriptionResult;
    }
    throw error;
  }
}

export async function fetchSmartAssignment(
  data: SmartAssignmentDto,
): Promise<SmartAssignmentResult> {
  if (isMockMode()) return { recommendations: [] };

  try {
    const response = await POST(API.AI.SMART_ASSIGNMENT(), getHeaders(), data);
    return response.data as SmartAssignmentResult;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchSmartAssignment(data))) as SmartAssignmentResult;
    }
    throw error;
  }
}

export async function fetchAiProjectMetrics(
  projectId: string,
): Promise<AiProjectMetrics | null> {
  if (isMockMode()) return null;

  try {
    const response = await GET(API.AI.PROJECT_METRICS(projectId), getHeaders());
    return response.data as AiProjectMetrics;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchAiProjectMetrics(projectId))) ?? null;
    }
    throw error;
  }
}

export async function submitPredictionOutcomeFeedback(
  data: PredictionOutcomeFeedbackDto,
): Promise<PredictionOutcomeFeedbackResult> {
  if (isMockMode()) {
    return {
      taskId: data.taskId,
      estimatedHours: data.actualHours,
      actualHours: data.actualHours,
      absoluteErrorHours: 0,
    } as PredictionOutcomeFeedbackResult;
  }

  try {
    const response = await POST(API.AI.PREDICTION_FEEDBACK(), getHeaders(), data);
    return response.data as PredictionOutcomeFeedbackResult;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        submitPredictionOutcomeFeedback(data),
      )) as PredictionOutcomeFeedbackResult;
    }
    throw error;
  }
}

export async function fetchProjectAnomalies(
  projectId: string,
): Promise<ProjectAnomaliesResult> {
  if (isMockMode()) return { anomalies: [] };

  try {
    const response = await GET(API.AI.PROJECT_ANOMALIES(projectId), getHeaders());
    return response.data as ProjectAnomaliesResult;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        fetchProjectAnomalies(projectId),
      )) as ProjectAnomaliesResult;
    }
    throw error;
  }
}
