import type { UserType } from "../types/users";

export interface ProfileCompletionItem {
  key: "name" | "email" | "phone" | "image";
  label: string;
  complete: boolean;
  hint?: string;
}

export interface ProfileCompletionSummary {
  percentage: number;
  completedCount: number;
  totalCount: number;
  missingCount: number;
  items: ProfileCompletionItem[];
}

export function getProfileCompletionSummary(
  user?: UserType | null,
): ProfileCompletionSummary {
  const items: ProfileCompletionItem[] = [
    {
      key: "name",
      label: "Full name",
      complete: !!user?.name?.trim(),
    },
    {
      key: "email",
      label: "Email",
      complete: !!user?.email?.trim(),
    },
    {
      key: "phone",
      label: "Phone number",
      complete: !!user?.phone?.trim(),
      hint: "Add a direct contact number for reminders and coordination.",
    },
    {
      key: "image",
      label: "Profile photo",
      complete: !!user?.image?.trim(),
      hint: "Add a profile image so teammates can recognize you faster.",
    },
  ];

  const completedCount = items.filter((item) => item.complete).length;
  const totalCount = items.length;
  const missingCount = totalCount - completedCount;

  return {
    percentage: Math.round((completedCount / totalCount) * 100),
    completedCount,
    totalCount,
    missingCount,
    items,
  };
}
