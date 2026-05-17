"use client";

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Code2,
  Palette,
  Megaphone,
  Rocket,
  Users,
  Handshake,
  Cog,
} from "lucide-react";
import type { BusinessUnit, ProjectTypeEnum } from "./projects";

export type ProjectTemplateCategory =
  | "Software"
  | "Marketing"
  | "Design"
  | "HR"
  | "Sales"
  | "Product"
  | "Operations";

export interface ProjectTemplatePreset {
  id: string;
  title: string;
  category: ProjectTemplateCategory;
  description: string;
  projectType: ProjectTypeEnum;
  businessUnit: BusinessUnit;
  defaultName: string;
  defaultDescription: string;
  defaultDetails: string;
  accent: string;
  icon: LucideIcon;
  roadmapHints?: string[];
}

export const PROJECT_TEMPLATE_PRESETS: ProjectTemplatePreset[] = [
  {
    id: "agile-development",
    title: "Agile Development",
    category: "Software",
    description: "Manage sprints, backlog, bugs, and delivery milestones for product teams.",
    projectType: "AGILE",
    businessUnit: "TawerDev",
    defaultName: "Agile Product Delivery",
    defaultDescription:
      "Cross-functional development project focused on structured sprint planning, delivery tracking, and issue resolution.",
    defaultDetails:
      "<p><strong>Recommended setup:</strong></p><ul><li>Use sprint planning for 2-week cycles</li><li>Track backlog, in-progress work, and release milestones</li><li>Coordinate engineering, QA, and product review checkpoints</li></ul>",
    accent: "from-blue-500/20 via-primary/10 to-cyan-500/10",
    icon: Code2,
    roadmapHints: ["Sprint 0 setup", "Core feature implementation", "QA and release prep"],
  },
  {
    id: "content-calendar",
    title: "Content Calendar",
    category: "Marketing",
    description: "Plan campaigns, social content, reviews, and publishing rhythm in one place.",
    projectType: "FREESTYLE",
    businessUnit: "TawerCreative",
    defaultName: "Content Campaign Calendar",
    defaultDescription:
      "Editorial and campaign planning workspace for marketing content, reviews, approvals, and publication scheduling.",
    defaultDetails:
      "<p><strong>Suggested workflow:</strong></p><ul><li>Map campaign themes by week</li><li>Assign design and copy review checkpoints</li><li>Track publication targets and launch windows</li></ul>",
    accent: "from-pink-500/20 via-primary/10 to-orange-400/10",
    icon: Megaphone,
    roadmapHints: ["Campaign brief", "Asset production", "Review and publishing"],
  },
  {
    id: "design-requests",
    title: "Design Requests",
    category: "Design",
    description: "Organize incoming design work, revisions, approvals, and asset delivery.",
    projectType: "FREESTYLE",
    businessUnit: "TawerCreative",
    defaultName: "Design Request Pipeline",
    defaultDescription:
      "Structured design intake project for creative requests, stakeholder review, and asset finalization.",
    defaultDetails:
      "<p><strong>Typical structure:</strong></p><ul><li>Request intake and triage</li><li>Concept creation and feedback loops</li><li>Final delivery and asset handoff</li></ul>",
    accent: "from-violet-500/20 via-primary/10 to-fuchsia-400/10",
    icon: Palette,
    roadmapHints: ["Intake queue", "Design reviews", "Final export pack"],
  },
  {
    id: "product-launch",
    title: "Product Launch",
    category: "Product",
    description: "Coordinate launch readiness across product, engineering, marketing, and support.",
    projectType: "AGILE",
    businessUnit: "TawerDev",
    defaultName: "Product Launch Readiness",
    defaultDescription:
      "Cross-team launch plan covering development completion, release preparation, communications, and post-launch follow-up.",
    defaultDetails:
      "<p><strong>Launch lanes:</strong></p><ul><li>Release readiness and validation</li><li>Marketing rollout and announcement tasks</li><li>Post-launch monitoring and hotfix planning</li></ul>",
    accent: "from-amber-500/20 via-primary/10 to-rose-500/10",
    icon: Rocket,
    roadmapHints: ["Launch planning", "Go-live readiness", "Post-launch stabilization"],
  },
  {
    id: "recruitment-pipeline",
    title: "Recruitment Pipeline",
    category: "HR",
    description: "Track hiring stages, candidate reviews, interviews, and offer readiness.",
    projectType: "FREESTYLE",
    businessUnit: "TawerCreative",
    defaultName: "Recruitment Pipeline",
    defaultDescription:
      "Hiring operations workspace for screening, interviews, evaluation, and offer coordination.",
    defaultDetails:
      "<p><strong>Recommended stages:</strong></p><ul><li>Candidate sourcing and triage</li><li>Interview loops and scorecards</li><li>Offer, onboarding, and close-out tasks</li></ul>",
    accent: "from-emerald-500/20 via-primary/10 to-lime-400/10",
    icon: Users,
    roadmapHints: ["Sourcing", "Interview loop", "Offer coordination"],
  },
  {
    id: "simple-crm",
    title: "Simple CRM",
    category: "Sales",
    description: "Track leads, deals, follow-ups, and account handoff in a lightweight workflow.",
    projectType: "FREESTYLE",
    businessUnit: "TawerCreative",
    defaultName: "Sales Pipeline Tracker",
    defaultDescription:
      "Simple deal and relationship workflow for lead qualification, follow-ups, and closing readiness.",
    defaultDetails:
      "<p><strong>Suggested usage:</strong></p><ul><li>Manage lead status and next actions</li><li>Track proposals and stakeholder conversations</li><li>Prepare handoff to delivery once closed</li></ul>",
    accent: "from-indigo-500/20 via-primary/10 to-sky-400/10",
    icon: Handshake,
    roadmapHints: ["Lead capture", "Deal progression", "Client handoff"],
  },
  {
    id: "operations-rollout",
    title: "Operations Rollout",
    category: "Operations",
    description: "Coordinate process changes, internal rollouts, checklists, and cross-team adoption.",
    projectType: "FREESTYLE",
    businessUnit: "TawerDev",
    defaultName: "Operations Rollout",
    defaultDescription:
      "Operational implementation project for internal process changes, adoption, and compliance follow-through.",
    defaultDetails:
      "<p><strong>Suggested tracks:</strong></p><ul><li>Planning and stakeholder alignment</li><li>Rollout execution and checklists</li><li>Adoption review and retrospective</li></ul>",
    accent: "from-slate-500/20 via-primary/10 to-zinc-400/10",
    icon: Cog,
    roadmapHints: ["Rollout preparation", "Execution window", "Adoption review"],
  },
];

export const PROJECT_TEMPLATE_CATEGORIES: Array<ProjectTemplateCategory | "All Templates"> = [
  "All Templates",
  "Software",
  "Marketing",
  "Design",
  "HR",
  "Sales",
  "Product",
  "Operations",
];

export function findProjectTemplatePreset(templateId?: string | null) {
  if (!templateId) return null;
  return PROJECT_TEMPLATE_PRESETS.find((template) => template.id === templateId) ?? null;
}
