import { AxiosError } from "axios";

import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import type { EventLocationSuggestionType } from "../../types";

interface SearchEventLocationsParams {
  query: string;
  limit?: number;
}

interface ReverseEventLocationParams {
  latitude: number;
  longitude: number;
}

function getEventHeaders() {
  const { access } = extractJWTokens();
  return {
    Authorization: `Bearer ${access}`,
  };
}

export async function searchEventLocations(params: SearchEventLocationsParams): Promise<any> {
  const headers = getEventHeaders();

  try {
    const response = await GET(
      `/events/location/search?q=${encodeURIComponent(params.query)}&limit=${params.limit ?? 5}`,
      headers,
    );

    return response.data as EventLocationSuggestionType[];
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const refreshed = await refreshToken(() => searchEventLocations(params));
      return refreshed ?? [];
    }

    throw error;
  }
}

export async function reverseEventLocation(params: ReverseEventLocationParams): Promise<any> {
  const headers = getEventHeaders();

  try {
    const response = await GET(
      `/events/location/reverse?latitude=${params.latitude}&longitude=${params.longitude}`,
      headers,
    );

    return (response.data ?? null) as EventLocationSuggestionType | null;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const refreshed = await refreshToken(() => reverseEventLocation(params));
      return refreshed ?? null;
    }

    throw error;
  }
}
