import { requestAccessTokenRefresh } from "@/lib/http-methods";
import useUserStore from "../store/user-store";

export async function refreshToken<T>(onSuccess: () => Promise<T> | T): Promise<Awaited<T> | null> {
  const accessToken = await requestAccessTokenRefresh({ redirectOnFailure: false });

  if (!accessToken) {
    useUserStore.getState().clearSession();
    return null;
  }

  try {
    return await onSuccess();
  } catch {
    useUserStore.getState().clearSession();
    return null;
  }
}

export async function initializeAuthSession() {
  try {
    await requestAccessTokenRefresh({ redirectOnFailure: false });
  } finally {
    useUserStore.getState().setSessionReady(true);
  }
}
