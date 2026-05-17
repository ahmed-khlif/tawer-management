"use client";

import PlatformAppearanceChangement from "@/components/platform-appearance/changement";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import { MonitorSmartphone, MoonStar, Palette } from "lucide-react";

export default function Page() {
  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={Palette}
        title="Appearance"
        description="Tune your workspace look and reading comfort without leaving the same premium admin shell."
        metrics={[
          { icon: MonitorSmartphone, label: "Workspace theme", tone: "primary" },
          { icon: MoonStar, label: "Light or dark mode", tone: "info" },
        ]}
      />
      <PlatformAppearanceChangement />
    </AdminPageShell>
  );
}
