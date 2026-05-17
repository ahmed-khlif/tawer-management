"use client";
import PersonalInfoChangement from "@/modules/auth/components/account/personal-info-changement";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import { Globe2, Settings, UserRound } from "lucide-react";

export default function Page() {
  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={UserRound}
        title="Account Settings"
        description="Manage your personal information, profile identity, and workspace language in the same polished system as project management."
        metrics={[
          { icon: Settings, label: "Profile controls", tone: "primary" },
          { icon: Globe2, label: "Language aware", tone: "info" },
        ]}
      />
      <PersonalInfoChangement />
    </AdminPageShell>
  );
}
