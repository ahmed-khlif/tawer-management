import axios, { AxiosError, InternalAxiosRequestConfig, RawAxiosRequestHeaders } from "axios";
import useUserStore from "@/modules/auth/store/user-store";

const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_ADDRESS ||
    "http://localhost:3000",
  timeout: 40000, //40 seconds
  withCredentials: true
});

const refreshClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_ADDRESS ||
    "http://localhost:3000",
  timeout: 40000,
  withCredentials: true
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

function isMissingAuthorizationHeader(value: unknown): boolean {
  if (typeof value !== "string") {
    return !value;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "bearer undefined" || normalized === "bearer null" || normalized === "bearer";
}

function isAuthLifecycleRequest(url?: string): boolean {
  return !!url && ["/auths/login", "/auths/logout", "/auths/refresh"].some((path) => url.includes(path));
}

export async function requestAccessTokenRefresh(options?: { redirectOnFailure?: boolean }) {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await refreshClient.post("/auths/refresh", {});
        const accessToken = res.data?.access as string | undefined;

        if (!accessToken) {
          throw new Error("Missing access token in refresh response.");
        }

        useUserStore.getState().setAccessToken(accessToken);
        return accessToken;
      } catch (error) {
        useUserStore.getState().clearSession();

        if (options?.redirectOnFailure && typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.assign("/login");
        }

        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const accessToken = useUserStore.getState().accessToken;
  const currentAuthorization = config.headers?.Authorization;

  if (isMissingAuthorizationHeader(currentAuthorization) && config.headers) {
    delete config.headers.Authorization;
  }

  if (accessToken && !config.headers?.Authorization) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthLifecycleRequest(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshedAccessToken = await requestAccessTokenRefresh({ redirectOnFailure: true });

    if (!refreshedAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;

    return apiClient(originalRequest);
  }
);

export function GET(uri: string, headers: RawAxiosRequestHeaders, params?: any) {
  return apiClient.get(uri, { headers: headers, ...params });
}

export function POST(uri: string, headers: RawAxiosRequestHeaders, data: any, params?: any) {
  return apiClient.post(uri, data, { headers, ...params });
}

export function PUT(uri: string, headers: RawAxiosRequestHeaders, data: any, params?: any) {
  return apiClient.put(uri, data, { headers, ...params });
}

export function PATCH(uri: string, headers: RawAxiosRequestHeaders, data: any, params?: any) {
  return apiClient.patch(uri, data, { headers, ...params });
}

export function DELETE(uri: string, headers: RawAxiosRequestHeaders, params?: any) {
  return apiClient.delete(uri, { headers: headers, ...params });
}
