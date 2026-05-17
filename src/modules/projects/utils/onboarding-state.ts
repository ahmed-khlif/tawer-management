"use client";

const ONBOARDING_STORAGE_KEY = "pm-onboarding-state";
const ONBOARDING_VERSION = 1;

export interface OnboardingState {
  completed: boolean;
  skipped: boolean;
  seenVersion: number;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getOnboardingState(): OnboardingState | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    if (typeof parsed !== "object" || parsed === null) return null;

    return {
      completed: Boolean(parsed.completed),
      skipped: Boolean(parsed.skipped),
      seenVersion:
        typeof parsed.seenVersion === "number" ? parsed.seenVersion : 0,
    };
  } catch {
    return null;
  }
}

export function shouldShowOnboarding() {
  const state = getOnboardingState();
  if (!state) return true;
  return state.seenVersion < ONBOARDING_VERSION || (!state.completed && !state.skipped);
}

export function markOnboardingCompleted() {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    ONBOARDING_STORAGE_KEY,
    JSON.stringify({
      completed: true,
      skipped: false,
      seenVersion: ONBOARDING_VERSION,
    } satisfies OnboardingState),
  );
}

export function markOnboardingSkipped() {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    ONBOARDING_STORAGE_KEY,
    JSON.stringify({
      completed: false,
      skipped: true,
      seenVersion: ONBOARDING_VERSION,
    } satisfies OnboardingState),
  );
}
