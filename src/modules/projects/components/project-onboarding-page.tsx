"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  CalendarRange,
  ChevronRight,
  FolderKanban,
  Layers3,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import {
  canCreateFromProjectTemplates,
  canViewProjectTemplates,
} from "@/modules/projects/utils/template-access";
import {
  markOnboardingCompleted,
  markOnboardingSkipped,
} from "@/modules/projects/utils/onboarding-state";

const ONBOARDING_STEPS = [
  {
    id: "workspace",
    eyebrow: "Welcome aboard",
    title: "Manage Projects Effortlessly",
    description:
      "Streamline your workflow with structured project spaces, clearer ownership, and a calmer way to track delivery.",
    icon: FolderKanban,
    graphic: (
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[28px] border bg-primary/5 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_50%)]" />
        <div className="grid w-full max-w-md grid-cols-[1.1fr_0.9fr] gap-4">
          <Card className="border-primary/20 bg-background/85 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FolderKanban className="size-5" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-28 rounded-full bg-primary/20" />
                  <div className="h-2 w-20 rounded-full bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-full rounded-full bg-muted" />
                <div className="h-2.5 w-5/6 rounded-full bg-muted" />
                <div className="h-2.5 w-2/3 rounded-full bg-muted" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 flex-1 rounded-lg bg-primary/12" />
                <div className="h-7 w-20 rounded-lg bg-muted" />
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col justify-between gap-4">
            <Card className="border-primary/20 bg-background/85 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="h-2.5 w-16 rounded-full bg-primary/25" />
                <div className="h-9 rounded-xl bg-primary/10" />
                <div className="h-2.5 w-12 rounded-full bg-muted" />
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-background/85 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </div>
                <div className="space-y-1">
                  <div className="h-2.5 w-20 rounded-full bg-primary/20" />
                  <div className="h-2.5 w-16 rounded-full bg-muted" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "templates",
    eyebrow: "Ready-made starters",
    title: "Start Faster With Templates",
    description:
      "Choose a project template that matches your team, then land inside the normal project creation flow with the right structure already prepared.",
    icon: Layers3,
    graphic: (
      <div className="grid aspect-[4/3] w-full grid-cols-2 gap-4 rounded-[28px] border bg-gradient-to-br from-primary/5 to-background p-5">
        {["Software", "Marketing", "Design", "Operations"].map((label, index) => (
          <Card key={label} className="border-primary/15 bg-background/85 shadow-sm">
            <CardContent className="flex h-full flex-col justify-between p-4">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline">{label}</Badge>
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Layers3 className="size-4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 rounded-full bg-primary/20" />
                <div className="h-2.5 w-full rounded-full bg-muted" />
                <div className="h-2.5 w-4/5 rounded-full bg-muted" />
              </div>
              <div className={`h-8 rounded-lg ${index % 2 === 0 ? "bg-primary/12" : "bg-muted"}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    ),
  },
  {
    id: "execution",
    eyebrow: "Stay in sync",
    title: "Track Planning, Tasks, and Reminders Together",
    description:
      "Move from setup into execution with sprints, milestones, task boards, and reminders that keep delivery visible across the team.",
    icon: CalendarRange,
    graphic: (
      <div className="grid aspect-[4/3] w-full grid-cols-[1.1fr_0.9fr] gap-4 rounded-[28px] border bg-primary/5 p-5">
        <Card className="border-primary/20 bg-background/90 shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Sprint board</Badge>
              <CalendarRange className="size-4 text-primary" />
            </div>
            <div className="grid gap-2">
              <div className="rounded-xl border bg-background p-3">
                <div className="h-2.5 w-16 rounded-full bg-primary/20" />
                <div className="mt-2 h-2.5 w-4/5 rounded-full bg-muted" />
              </div>
              <div className="rounded-xl border bg-background p-3">
                <div className="h-2.5 w-14 rounded-full bg-primary/20" />
                <div className="mt-2 h-2.5 w-2/3 rounded-full bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="border-primary/20 bg-background/90 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell className="size-4" />
              </div>
              <div className="space-y-1">
                <div className="h-2.5 w-20 rounded-full bg-primary/20" />
                <div className="h-2.5 w-12 rounded-full bg-muted" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-background/90 shadow-sm">
            <CardContent className="space-y-2 p-4">
              <div className="h-2.5 w-16 rounded-full bg-primary/20" />
              <div className="h-2.5 w-full rounded-full bg-muted" />
              <div className="h-2.5 w-5/6 rounded-full bg-muted" />
              <div className="h-7 rounded-lg bg-primary/12" />
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
];

export default function ProjectOnboardingPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [stepIndex, setStepIndex] = React.useState(0);

  const canViewTemplates = !!user && canViewProjectTemplates(user.roles);
  const canCreateProjects = !!user && canCreateFromProjectTemplates(user.roles);
  const step = ONBOARDING_STEPS[stepIndex];
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  const finish = React.useCallback(() => {
    markOnboardingCompleted();
    router.replace(canViewTemplates ? "/dashboard/project-templates" : "/dashboard");
  }, [canViewTemplates, router]);

  const skip = React.useCallback(() => {
    markOnboardingSkipped();
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,255,245,1)_0%,rgba(249,247,255,1)_100%)] text-foreground dark:bg-[linear-gradient(180deg,rgba(15,12,27,1)_0%,rgba(25,20,44,1)_55%,rgba(14,11,24,1)_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 md:px-10 lg:px-14">
      <div className="mb-6 flex justify-end">
        <Button variant="ghost" className="gap-1 text-muted-foreground" onClick={skip}>
          Skip
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex flex-1 items-center">
      <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="order-2 space-y-6 lg:order-1 lg:pr-6">
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
            {step.eyebrow}
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl xl:text-6xl">
              {step.title}
            </h1>
            <p className="max-w-lg text-base leading-7 text-muted-foreground md:text-lg">
              {step.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {ONBOARDING_STEPS.map((item, index) => (
              <div
                key={item.id}
                className={
                  index === stepIndex
                    ? "h-2 w-10 rounded-full bg-primary"
                    : "h-2 w-2 rounded-full bg-primary/20"
                }
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {isLastStep ? (
              <Button className="gap-2 sm:min-w-[220px]" onClick={finish}>
                {canViewTemplates ? "Open project templates" : "Go to workspace"}
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                className="gap-2 sm:min-w-[220px]"
                onClick={() => setStepIndex((current) => Math.min(current + 1, ONBOARDING_STEPS.length - 1))}
              >
                Next
                <ArrowRight className="size-4" />
              </Button>
            )}

            <Button asChild variant="outline">
              <Link href={canViewTemplates ? "/dashboard/project-templates" : "/dashboard"}>
                {canViewTemplates
                  ? canCreateProjects
                    ? "Explore templates"
                    : "Browse templates"
                  : "Go to dashboard"}
              </Link>
            </Button>
          </div>
        </div>

        <div className="order-1 lg:order-2">{step.graphic}</div>
      </div>
      </div>
      </div>
    </div>
  );
}
