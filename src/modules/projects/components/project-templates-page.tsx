"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarRange,
  CheckCircle2,
  Code2,
  Cog,
  FolderKanban,
  Handshake,
  Layers3,
  Palette,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AccessDenied from "@/components/error/access-denied";
import { PageHeaderStrip } from "./shared/page-header-strip";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import type { ProjectTemplateCategory } from "../types/project-template-presets";
import {
  PROJECT_TEMPLATE_CATEGORIES,
  PROJECT_TEMPLATE_PRESETS,
} from "../types/project-template-presets";
import {
  businessUnitClasses,
  businessUnitFallbackClasses,
  businessUnitNamed,
  projectTypeClasses,
} from "../utils/badges/project-badges";
import {
  canCreateFromProjectTemplates,
  canViewProjectTemplates,
} from "../utils/template-access";

const CATEGORY_STYLES: Record<string, string> = {
  Software:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  Marketing:
    "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300",
  Design:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300",
  HR: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
  Sales:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300",
  Product:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300",
  Operations:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300",
};

const TEMPLATE_ART_BY_ID: Record<string, React.ReactNode> = {
  "agile-development": (
    <div className="absolute right-4 top-3 opacity-50">
      <svg width="92" height="92" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="80" cy="20" r="40" fill="currentColor" fillOpacity="0.18" />
        <circle cx="24" cy="78" r="12" fill="currentColor" fillOpacity="0.28" />
      </svg>
    </div>
  ),
  "content-calendar": (
    <div className="absolute bottom-0 left-0 p-2 opacity-45">
      <svg width="82" height="82" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <rect x="10" y="40" width="30" height="30" rx="4" fill="currentColor" fillOpacity="0.28" />
        <rect x="46" y="10" width="20" height="20" rx="4" fill="currentColor" fillOpacity="0.16" />
      </svg>
    </div>
  ),
  "product-launch": (
    <div className="absolute inset-0 flex items-center justify-center opacity-30">
      <svg width="200" height="100" viewBox="0 0 200 100" fill="none" aria-hidden="true">
        <path d="M0 100 C 50 0 150 0 200 100" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  ),
  "recruitment-pipeline": (
    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,rgba(190,176,248,0.25)_1px,transparent_1px)] [background-size:12px_12px]" />
  ),
  "design-requests": (
    <div className="absolute bottom-2 right-2 opacity-40">
      <Palette className="size-10 text-primary/40" />
    </div>
  ),
};

export default function ProjectTemplatesPage() {
  const { user } = useCurrentUser();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] =
    React.useState<ProjectTemplateCategory | "All Templates">("All Templates");
  const canBrowseTemplates = canViewProjectTemplates(user?.roles);
  const canCreateProjects = canCreateFromProjectTemplates(user?.roles);

  const filteredTemplates = React.useMemo(() => {
    return PROJECT_TEMPLATE_PRESETS.filter((template) => {
      const matchesCategory =
        category === "All Templates" || template.category === category;
      const haystack = [
        template.title,
        template.category,
        template.description,
        template.defaultDescription,
        template.bestFor,
        ...(template.roadmapHints ?? []),
        ...(template.starterChecklist ?? []),
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  if (!canBrowseTemplates) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/70 bg-[linear-gradient(135deg,hsl(var(--background))_0%,rgba(243,239,255,0.88)_60%,rgba(255,255,255,1)_100%)] p-6 shadow-sm dark:bg-[linear-gradient(135deg,rgba(12,10,24,1)_0%,rgba(32,24,54,0.95)_60%,rgba(20,16,35,1)_100%)]">
        <PageHeaderStrip
          className="border-0 bg-transparent p-0 shadow-none"
          icon={Sparkles}
          title="Project Templates"
          description="Start TDG projects with presets aligned to Tawer Dev, Tawer Creative, delivery planning, and operational follow-up."
          metrics={[
            {
              icon: FolderKanban,
              value: PROJECT_TEMPLATE_PRESETS.length,
              label: "templates",
              tone: "primary",
            },
            {
              icon: Briefcase,
              value: PROJECT_TEMPLATE_CATEGORIES.length - 1,
              label: "categories",
              tone: "info",
            },
            {
              icon: Layers3,
              value: "Dev + Creative",
              label: "business units",
              tone: "running",
            },
          ]}
          actions={
            canCreateProjects ? (
              <Button asChild size="sm">
                <Link href="/dashboard/projects?create=1">Create Project</Link>
              </Button>
            ) : null
          }
        />

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm dark:bg-background/40">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Code2 className="size-4 text-blue-500" />
              Tawer Dev
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Agile delivery, websites, APIs, infrastructure readiness, QA, and release preparation.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm dark:bg-background/40">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Palette className="size-4 text-pink-500" />
              Tawer Creative
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Brand identity, design requests, content calendars, campaign planning, and asset delivery.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm dark:bg-background/40">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" />
              AI-assisted kickoff
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Selected templates prefill project data, then the create sheet can suggest roadmap dates, milestones, and epics.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search templates..."
              className="border-border/70 bg-background/90 pl-9 shadow-sm dark:bg-background/60"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {PROJECT_TEMPLATE_CATEGORIES.map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={category === option ? "default" : "outline"}
                className={
                  category === option
                    ? "rounded-full"
                    : "rounded-full border-border/70 bg-background/85 text-foreground hover:bg-accent dark:bg-background/50"
                }
                onClick={() => setCategory(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="group relative min-h-[300px] gap-0 overflow-hidden border-2 border-dashed border-primary/35 bg-background/80 py-0 transition-all duration-300 hover:border-primary hover:bg-card hover:shadow-[0_4px_20px_-2px_rgba(190,176,248,0.15)] dark:bg-card/90 dark:hover:bg-card">
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center px-6 py-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
              <Plus className="size-8" />
            </div>
            <h3 className="relative text-lg font-bold text-foreground">Start from Scratch</h3>
            <p className="relative mt-2 max-w-[220px] text-sm leading-relaxed text-muted-foreground">
              Build your workflow from the ground up tailored to your exact needs.
            </p>
            {canCreateProjects ? (
              <Button asChild className="relative mt-6 w-full">
                <Link href="/dashboard/projects?create=1">Create blank project</Link>
              </Button>
            ) : (
              <p className="relative mt-6 text-xs font-medium text-muted-foreground">
                Project creation is limited to users with project creation permission.
              </p>
            )}
          </CardContent>
        </Card>

        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          const categoryClass =
            CATEGORY_STYLES[template.category] ??
            "border-primary/20 bg-primary/10 text-primary";
          const projectTypeClass = projectTypeClasses[template.projectType];
          const businessUnitClass =
            businessUnitClasses[template.businessUnit] ?? businessUnitFallbackClasses;
          const businessUnitLabel =
            businessUnitNamed[template.businessUnit] ?? template.businessUnit;

          return (
            <Card
              key={template.id}
              className="group gap-0 overflow-hidden rounded-xl border border-border/60 bg-card py-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_10px_25px_-5px_rgba(190,176,248,0.25)] dark:border-border/80"
            >
              <div
                className={`relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br ${template.accent} text-primary/60 dark:text-primary/70`}
              >
                <div className="absolute inset-0 bg-background/35 dark:bg-background/10" />
                {TEMPLATE_ART_BY_ID[template.id] ?? null}
                <Icon className="relative z-10 size-12" />
              </div>

              <CardContent className="flex flex-1 flex-col px-6 py-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${categoryClass}`}>
                    {template.category}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                  {template.title}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-7 text-muted-foreground">
                  {template.description}
                </p>

                <div className="mb-4 rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Best for
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {template.bestFor}
                  </p>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className={projectTypeClass}>
                    {template.projectType}
                  </Badge>
                  <Badge variant="outline" className={businessUnitClass}>
                    {businessUnitLabel}
                  </Badge>
                </div>

                {template.starterChecklist?.length ? (
                  <div className="mb-5 space-y-2">
                    {template.starterChecklist.slice(0, 3).map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span className="leading-5">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {canCreateProjects ? (
                  <Button
                    asChild
                    variant="outline"
                    className="group/btn w-full gap-2 border-primary/30 bg-background/60 text-foreground hover:bg-primary hover:text-foreground dark:bg-background/30"
                  >
                    <Link href={`/dashboard/projects?create=1&template=${template.id}`}>
                      Use Template
                      <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                ) : (
                  <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    Visible for planning reference. Ask a project manager to create from this template.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        </section>

        {!filteredTemplates.length ? (
          <Card>
            <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <Search className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">No templates match this filter</p>
                <p className="text-sm text-muted-foreground">
                  Clear the current search or switch categories to explore other project starters.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      
    </div>
  );
}
