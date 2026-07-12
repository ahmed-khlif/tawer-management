"use client";

import { AlertTriangle, CalendarClock, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import MetricCard from "@/modules/projects/components/shared/metric-card";

interface InfrastructureOverviewCardsProps {
  total?: number;
  running?: number;
  incidentsOpen?: number;
  expiringSoon?: number;
  unpaid?: number;
  lastHealthCheckAt?: string;
  totalLabel: string;
  runningLabel: string;
  incidentsLabel: string;
  expiringLabel: string;
  unpaidLabel: string;
  totalHint?: string;
  runningHint?: string;
  incidentsHint?: string;
  expiringHint?: string;
  unpaidHint?: string;
  loading?: boolean;
}

export function InfrastructureOverviewCards({
  total = 0,
  running = 0,
  incidentsOpen = 0,
  expiringSoon = 0,
  unpaid = 0,
  lastHealthCheckAt,
  totalLabel,
  runningLabel,
  incidentsLabel,
  expiringLabel,
  unpaidLabel,
  totalHint,
  runningHint,
  incidentsHint,
  expiringHint,
  unpaidHint,
  loading = false,
}: InfrastructureOverviewCardsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        icon={ShieldCheck}
        label={totalLabel}
        value={total}
        hint={totalHint}
        tone="primary"
        loading={loading}
      />
      <MetricCard
        icon={CheckCircle2}
        label={runningLabel}
        value={running}
        hint={runningHint ?? (lastHealthCheckAt ? `Last health check ${lastHealthCheckAt}` : undefined)}
        tone="running"
        emphasize
        loading={loading}
      />
      <MetricCard
        icon={AlertTriangle}
        label={incidentsLabel}
        value={incidentsOpen}
        hint={incidentsHint}
        tone={incidentsOpen > 0 ? "destructive" : "success"}
        emphasize={incidentsOpen > 0}
        loading={loading}
      />
      <MetricCard
        icon={CalendarClock}
        label={expiringLabel}
        value={expiringSoon}
        hint={expiringHint}
        tone={expiringSoon > 0 ? "warning" : "info"}
        emphasize={expiringSoon > 0}
        loading={loading}
      />
      <MetricCard
        icon={CreditCard}
        label={unpaidLabel}
        value={unpaid}
        hint={unpaidHint}
        tone={unpaid > 0 ? "warning" : "success"}
        emphasize={unpaid > 0}
        loading={loading}
      />
    </div>
  );
}

export default InfrastructureOverviewCards;
