"use client";

import React from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  Info,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";

type AlertTone = "primary" | "warning" | "destructive";

export default function RulesPage() {
  const t = useTranslations("rules");
  const sections = t.raw("sections");

  const summaryCards = [
    {
      title: "Work mode",
      value: "1 remote day",
      helper: "Everything else is on-site and approved around team needs.",
      icon: Building2,
      tone: "text-primary",
      surface: "from-primary/8 via-primary/5 to-transparent",
    },
    {
      title: "Working rhythm",
      value: "Structured schedule",
      helper: "Clear morning, break, and afternoon blocks across business units.",
      icon: Clock3,
      tone: "text-sky-600",
      surface: "from-sky-500/10 via-sky-500/5 to-transparent",
    },
    {
      title: "Leave policy",
      value: "18 paid days / year",
      helper: "Accrued monthly and planned with team organization in mind.",
      icon: BadgeCheck,
      tone: "text-emerald-600",
      surface: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeaderStrip
          icon={Scale}
          title={t("title")}
          description={`${t("company")} · Internal standards for work mode, attendance, leave, and platform discipline.`}
          iconTone="primary"
          metrics={[
            {
              icon: Building2,
              label: "TDG internal policy",
              tone: "primary",
            },
            {
              icon: CheckCircle2,
              value: 6,
              label: "policy areas",
              tone: "success",
            },
            {
              icon: ShieldAlert,
              label: "Mandatory compliance",
              tone: "warning",
            },
          ]}
        />

        <section className="grid gap-4 lg:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className={cn(
                  "relative overflow-hidden border-border/70 bg-card/95 shadow-sm",
                  "before:absolute before:inset-0 before:bg-gradient-to-br before:content-['']",
                  `before:${card.surface}`,
                )}
              >
                <CardContent className="relative p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {card.title}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground">
                        {card.value}
                      </h3>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/80 p-2.5 shadow-sm">
                      <Icon className={cn("size-5", card.tone)} />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {card.helper}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <SectionCard
              icon={<CheckCircle2 className="size-5 text-emerald-600" />}
              eyebrow="Foundation"
              title={sections.generalPrinciples.title}
              description={sections.generalPrinciples.description}
              alerts={[
                {
                  type: "primary",
                  text: sections.generalPrinciples.important,
                  icon: <CheckCircle2 className="size-4" />,
                },
              ]}
            />

            <SectionCard
              icon={<Info className="size-5 text-sky-600" />}
              eyebrow="Presence policy"
              title={sections.workMode.title}
              content={[
                { label: "Mandatory", text: sections.workMode.mandatory },
                { label: "Details", text: sections.workMode.details },
                { label: "Planning note", text: sections.workMode.note },
              ]}
              alerts={[
                {
                  type: "warning",
                  text: sections.workMode.warning,
                  icon: <AlertTriangle className="size-4" />,
                },
              ]}
            />

            <SectionCard
              icon={<Clock3 className="size-5 text-sky-600" />}
              eyebrow="Attendance"
              title={sections.workingHours.title}
              content={[
                {
                  label: sections.workingHours.tawerDev.name,
                  items: [
                    sections.workingHours.tawerDev.days,
                    `Morning: ${sections.workingHours.tawerDev.morning}`,
                    `Break: ${sections.workingHours.tawerDev.break}`,
                    `Afternoon: ${sections.workingHours.tawerDev.afternoon}`,
                  ],
                },
                {
                  label: sections.workingHours.tawerCRV.name,
                  items: [
                    sections.workingHours.tawerCRV.weekday,
                    `Morning: ${sections.workingHours.tawerCRV.weekdayMorning}`,
                    `Break: ${sections.workingHours.tawerCRV.weekdayBreak}`,
                    `Afternoon: ${sections.workingHours.tawerCRV.weekdayAfternoon}`,
                    `${sections.workingHours.tawerCRV.saturday}: ${sections.workingHours.tawerCRV.saturdayHours}`,
                  ],
                },
              ]}
              alerts={[
                {
                  type: "primary",
                  text: sections.workingHours.mandatory,
                  icon: <CheckCircle2 className="size-4" />,
                },
              ]}
            />

            <SectionCard
              icon={<ShieldAlert className="size-5 text-rose-600" />}
              eyebrow="Platform discipline"
              title={sections.platform.title}
              description={sections.platform.description}
              content={[
                { label: "Critical rule", text: sections.platform.critical },
                { label: "Check-in", text: sections.platform.checkIn },
                { label: "Check-out", text: sections.platform.checkOut },
                { label: "Break policy", text: sections.platform.breakRules },
                { label: "Break check-out", text: sections.platform.breakCheckOut },
                { label: "Break check-in", text: sections.platform.breakCheckIn },
              ]}
              alerts={[
                {
                  type: "destructive",
                  text: sections.platform.warning,
                  icon: <AlertTriangle className="size-4" />,
                },
              ]}
            />

            <SectionCard
              icon={<BadgeCheck className="size-5 text-emerald-600" />}
              eyebrow="Time off"
              title={sections.leaves.title}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <SubsectionCard
                  title={sections.leaves.paidLeave.title}
                  items={[
                    sections.leaves.paidLeave.mandatory,
                    sections.leaves.paidLeave.annual,
                    sections.leaves.paidLeave.note,
                    sections.leaves.paidLeave.planning,
                  ]}
                />
                <SubsectionCard
                  title={sections.leaves.sickLeave.title}
                  items={[
                    sections.leaves.sickLeave.requirement,
                    sections.leaves.sickLeave.verification,
                  ]}
                />
                <SubsectionCard
                  title={sections.leaves.specialLeave.title}
                  items={[
                    sections.leaves.specialLeave.marriage,
                    sections.leaves.specialLeave.birth,
                    sections.leaves.specialLeave.circumcision,
                  ]}
                />
                <SubsectionCard
                  title={sections.leaves.publicHolidays.title}
                  items={sections.leaves.publicHolidays.dates}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={<AlertTriangle className="size-5 text-rose-600" />}
              eyebrow="Compliance"
              title={sections.compliance.title}
              alerts={[
                {
                  type: "primary",
                  text: sections.compliance.mandatory,
                  icon: <CheckCircle2 className="size-4" />,
                },
                {
                  type: "destructive",
                  text: sections.compliance.warning,
                  icon: <AlertTriangle className="size-4" />,
                },
              ]}
            />
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card className="border-border/70 bg-card/95 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Quick read
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  What matters most
                </h3>
                <div className="mt-4 space-y-3">
                  <QuickRule
                    label="Remote work"
                    value={sections.workMode.mandatory}
                  />
                  <QuickRule
                    label="Platform usage"
                    value={sections.platform.critical}
                  />
                  <QuickRule
                    label="Leave accrual"
                    value={sections.leaves.paidLeave.annual}
                  />
                  <QuickRule
                    label="Sick leave"
                    value={sections.leaves.sickLeave.requirement}
                  />
                </div>
              </CardContent>
            </Card>

            <Alert className="border-primary/25 bg-primary/8">
              <CheckCircle2 className="size-4 text-primary" />
              <AlertDescription className="text-sm leading-6 text-foreground">
                These rules are presented as an operational handbook, so employees can scan them quickly without losing the formal policy meaning.
              </AlertDescription>
            </Alert>
          </aside>
        </div>
      </div>
    </main>
  );
}

interface SectionCardProps {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  content?: Array<{ label?: string; text?: string; items?: string[] }>;
  alerts?: Array<{
    type: AlertTone;
    text: string;
    icon: React.ReactNode;
  }>;
  children?: React.ReactNode;
}

function SectionCard({
  icon,
  eyebrow,
  title,
  description,
  content,
  alerts,
  children,
}: SectionCardProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {content?.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {content.map((item, idx) => (
              <div
                key={`${title}-${idx}`}
                className="rounded-xl border border-border/60 bg-muted/20 p-4"
              >
                {item.label ? (
                  <p className="text-sm font-semibold text-foreground">
                    {item.label}
                  </p>
                ) : null}
                {item.text ? (
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                ) : null}
                {item.items?.length ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    {item.items.map((subItem, subIdx) => (
                      <li key={`${title}-${idx}-${subIdx}`} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" />
                        <span>{subItem}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {alerts?.length ? (
          <div className="mt-5 space-y-3">
            {alerts.map((alert, idx) => (
              <Alert key={`${title}-alert-${idx}`} className={alertClasses(alert.type)}>
                {alert.icon}
                <AlertDescription className="text-sm leading-6 text-foreground">
                  {alert.text}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : null}

        {children ? <div className="mt-5">{children}</div> : null}
      </CardContent>
    </Card>
  );
}

function alertClasses(type: AlertTone) {
  switch (type) {
    case "primary":
      return "border-primary/25 bg-primary/8";
    case "warning":
      return "border-amber-500/30 bg-amber-500/10";
    case "destructive":
      return "border-destructive/25 bg-destructive/10";
    default:
      return "";
  }
}

function SubsectionCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/25 p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
        {items.map((item, idx) => (
          <li key={`${title}-${idx}`} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickRule({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <Badge variant="outline" className="border-primary/20 bg-primary/8 text-primary">
          Key
        </Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}
