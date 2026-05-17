import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";
import { SidebarNav } from "@/components/shared/sidebar-nav";

const navItems = [
  {
    title: "Account",
    href: "/dashboard/account-settings/account",
    icon: "UserIcon"
  },
  {
    title: "Password",
    href: "/dashboard/account-settings/password",
    icon: "ShieldIcon"
  },
  {
    title: "Appearance",
    href: "/dashboard/account-settings/appearance",
    icon: "PaletteIcon"
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Account Settings Page",
    description:
      "Manage your account settings including profile, appearance, billing, notifications, and password.",
    canonical: "/pages/account-settings"
  });
}

export default async function AccountSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">Account Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account configuration, credentials, and appearance in the same polished workspace rhythm.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-24">
          <SidebarNav navItems={navItems} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
