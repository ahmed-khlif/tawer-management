import { POST } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import type {
  EpicAiPreviewPayload,
  EpicAiPreviewResult,
  MilestoneAiPreviewPayload,
  MilestoneAiPreviewResult,
  ProjectRoadmapPreviewPayload,
  ProjectRoadmapPreviewResult,
  SprintAiPreviewPayload,
  SprintAiPreviewResult,
  TaskAiPreviewPayload,
  TaskAiPreviewResult,
} from "@/modules/projects/types/project-ai-preview";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function previewProjectRoadmap(
  data: ProjectRoadmapPreviewPayload,
): Promise<ProjectRoadmapPreviewResult> {
  try {
    const response = await POST(API.PROJECTS.ROADMAP_PREVIEW(), getHeaders(), data);
    return response.data as ProjectRoadmapPreviewResult;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => previewProjectRoadmap(data))) as ProjectRoadmapPreviewResult;
    }
    throw error;
  }
}

export async function previewTaskAi(
  projectId: string,
  data: TaskAiPreviewPayload,
): Promise<TaskAiPreviewResult> {
  try {
    const response = await POST(API.TASKS.AI_PREVIEW(projectId), getHeaders(), data);
    return response.data as TaskAiPreviewResult;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => previewTaskAi(projectId, data))) as TaskAiPreviewResult;
    }
    throw error;
  }
}

export async function previewMilestoneAi(
  projectId: string,
  data: MilestoneAiPreviewPayload,
): Promise<MilestoneAiPreviewResult> {
  try {
    const response = await POST(API.MILESTONES.AI_PREVIEW(projectId), getHeaders(), data);
    return response.data as MilestoneAiPreviewResult;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => previewMilestoneAi(projectId, data))) as MilestoneAiPreviewResult;
    }
    throw error;
  }
}

export async function previewEpicAi(
  projectId: string,
  data: EpicAiPreviewPayload,
): Promise<EpicAiPreviewResult> {
  try {
    const response = await POST(API.EPICS.AI_PREVIEW(projectId), getHeaders(), data);
    return response.data as EpicAiPreviewResult;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => previewEpicAi(projectId, data))) as EpicAiPreviewResult;
    }
    throw error;
  }
}

export async function previewSprintAi(
  projectId: string,
  data: SprintAiPreviewPayload,
): Promise<SprintAiPreviewResult> {
  try {
    const response = await POST(API.SPRINTS.AI_PREVIEW(projectId), getHeaders(), data);
    return response.data as SprintAiPreviewResult;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => previewSprintAi(projectId, data))) as SprintAiPreviewResult;
    }
    throw error;
  }
}
