"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getProfileCompletionSummary,
  type ProfileCompletionSummary,
} from "../../utils/profile-completion";
import type { UserType } from "../../types/users";

function CompletionRing({ percentage }: { percentage: number }) {
  const size = 92;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, percentage)) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-border/70"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="stroke-primary transition-[stroke-dashoffset] duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight">{percentage}%</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Complete
        </span>
      </div>
    </div>
  );
}

interface Props {
  user: UserType;
  compact?: boolean;
  actionHref?: string | null;
  actionLabel?: string;
}

export function ProfileCompletionCard({
  user,
  compact = false,
  actionHref = "/dashboard/account-settings/account",
  actionLabel = "Complete profile",
}: Props) {
  const summary = getProfileCompletionSummary(user);

  return (
    <Card className="border-border/70 bg-card/95 shadow-sm">
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <CardTitle className="text-sm font-semibold">Profile completion</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "space-y-3")}>
        <div className={cn("flex gap-4", compact ? "items-center" : "items-start")}>
          <CompletionRing percentage={summary.percentage} />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm text-muted-foreground">
              {summary.missingCount === 0
                ? "Everything important is filled in. Your teammate profile is ready."
                : `${summary.completedCount} of ${summary.totalCount} identity details are complete. Finish the missing fields when you are ready.`}
            </p>
            {!compact ? (
              <ul className="space-y-2">
                {summary.items.map((item) => (
                  <li key={item.key} className="flex items-start gap-2">
                    {item.complete ? (
                      <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
                    ) : (
                      <Circle className="mt-0.5 size-4 text-muted-foreground" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          item.complete ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {item.label}
                      </p>
                      {!item.complete && item.hint ? (
                        <p className="text-xs text-muted-foreground">{item.hint}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {actionHref ? (
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href={actionHref}>
              {actionLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Fill in the missing details below whenever you are ready.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function getCompletionSummaryForUser(user: UserType): ProfileCompletionSummary {
  return getProfileCompletionSummary(user);
}
