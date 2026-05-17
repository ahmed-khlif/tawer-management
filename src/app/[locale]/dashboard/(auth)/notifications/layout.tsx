import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Account Settings Page",
    description:
      "Manage your account settings including profile, appearance, billing, notifications, and password.",
    canonical: "/pages/account-settings"
  });
}

export default async function AccountSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
