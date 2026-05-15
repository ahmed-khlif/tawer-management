import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { GET } from "@/lib/http-methods";
import castToActivityTrackingType from "../dto/responses/activity-tracking";
import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD

export async function retreiveCurrentWorkDayFromServerSide() {
  if (USE_MOCK()) return null; // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  if (!access) return null;

  const headers = {
    Authorization: `Bearer ${access}`,
  };

  try {
    const response = await GET(`/work-days/current`, headers, {
      // 404 is the legitimate "no active work-day session" response —
      // treat it as a normal outcome instead of letting axios log it as an error.
      validateStatus: (status: number) =>
        (status >= 200 && status < 300) || status === 404,
    });

    if (response.status === 404 || !response.data) return null;

    return castToActivityTrackingType(response.data);
  } catch {
    return null;
  }
}
