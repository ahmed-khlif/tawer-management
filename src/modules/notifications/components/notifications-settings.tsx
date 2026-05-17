"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BellRing, CheckCircle2, Copy, MessageSquareShare, Mail, Smartphone, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/page-loader";
import { ErrorBanner } from "@/components/error-banner";
import useCopy from "@/hooks/use-copy";
import { cn } from "@/lib/utils";
import useNotificationsSettingsUpload from "../hook/use-notifications-settings-upload";
import usePersonalNotificationsSettings from "../hook/use-personal-notifications-settings";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { MetricCard } from "@/modules/projects/components/shared/metric-card";

export default function NotificationSettings() {
  const t = useTranslations("modules.notifications.settings");

  const { settings, isLoading } = usePersonalNotificationsSettings();
  const {
    error,
    emailNotifications,
    setEmailNotifications,
    telegramNotifications,
    setTelegramNotifications,
    telegramChatId,
    setTelegramChatId,
    ntfyNotifications,
    setNtfyNotifications,
    onSubmit,
    isPending,
  } = useNotificationsSettingsUpload();
  const { copied, copyToClipboard } = useCopy();

  if (isLoading) return <Loading />;

  const enabledChannels = [
    emailNotifications,
    telegramNotifications,
    ntfyNotifications,
  ].filter(Boolean).length;

  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={BellRing}
        title={t("title")}
        description={t("subtitle")}
        metrics={[
          {
            icon: CheckCircle2,
            value: enabledChannels,
            label: "channels enabled",
            tone: "primary",
          },
          emailNotifications
            ? { icon: Mail, label: "Email on", tone: "success" }
            : false,
          telegramNotifications || ntfyNotifications
            ? { icon: Smartphone, label: "Instant push active", tone: "info" }
            : false,
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={Mail}
          label="Email"
          value={emailNotifications ? "On" : "Off"}
          hint="Traditional inbox notifications"
          tone={emailNotifications ? "success" : "default"}
        />
        <MetricCard
          icon={MessageSquareShare}
          label="Telegram"
          value={telegramNotifications ? "On" : "Off"}
          hint="Bot-driven instant updates"
          tone={telegramNotifications ? "info" : "default"}
        />
        <MetricCard
          icon={Smartphone}
          label="NTFY"
          value={ntfyNotifications ? "On" : "Off"}
          hint="Push alerts on your devices"
          tone={ntfyNotifications ? "primary" : "default"}
        />
      </div>

      <div className="grid gap-4">
        <ChannelCard
          title={t("email.description")}
          description={t("email.details")}
          enabled={emailNotifications}
          onToggle={setEmailNotifications}
          icon={Mail}
        />

        <ChannelCard
          title={t("telegram.description")}
          description={t("telegram.details")}
          enabled={telegramNotifications}
          onToggle={setTelegramNotifications}
          icon={MessageSquareShare}
        >
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("telegram.chatId.label")}
            </label>
            <Input
              type="text"
              placeholder={t("telegram.chatId.placeholder")}
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="font-mono bg-background"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {t("telegram.chatId.hint")}
            </p>
          </div>
        </ChannelCard>

        <ChannelCard
          title={t("ntfy.toggle.description")}
          description={t("ntfy.toggle.details")}
          enabled={ntfyNotifications}
          onToggle={setNtfyNotifications}
          icon={Smartphone}
        >
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-foreground">1.</span>
                  <span className="flex space-x-1">
                    {t.rich("ntfy.steps.step1", {
                      link: (text) => (
                        <Button variant="link" className="h-fit w-fit px-1 py-0">
                          <Link href="https://ntfy.sh" target="_blank">
                            {text}
                          </Link>
                        </Button>
                      ),
                    })}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-foreground">2.</span>
                  <span>{t("ntfy.steps.step2")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-foreground">3.</span>
                  <span>
                    {t.rich("ntfy.steps.step3", {
                      url: () => (
                        <span className="font-bold">
                          {process.env.NTFY_SERVICE_URL as string}
                        </span>
                      ),
                    })}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-foreground">4.</span>
                  <span>{t("ntfy.steps.step4")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-foreground">5.</span>
                  <span>{t("ntfy.steps.step5")}</span>
                </li>
              </ol>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("ntfy.topic.label")}
              </p>
              {settings ? (
                <div className="space-y-3">
                  <code className="block rounded-lg bg-background px-3 py-2 text-sm font-mono">
                    {settings.ntfyTopic}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard({ text: settings.ntfyTopic })}
                    className="w-full gap-2 bg-background"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        {t("ntfy.topic.copied")}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        {t("ntfy.topic.copy")}
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </ChannelCard>
      </div>

      {error ? <ErrorBanner error={error} closeButtonIsUsed={false} /> : null}

      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-primary/15 bg-primary/10 p-2.5 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Notification delivery profile</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Save your preferred channels so reminders, alerts, and workspace updates reach you the right way.
              </p>
            </div>
          </div>
          <Button onClick={onSubmit} disabled={isPending} className="h-11 min-w-44 text-base font-medium">
            {isPending ? t("button.saving") : t("button.saveChanges")}
          </Button>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

interface ChannelCardProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}

function ChannelCard({
  title,
  description,
  enabled,
  onToggle,
  icon: Icon,
  children,
}: ChannelCardProps) {
  return (
    <Card className="border-border/70 bg-card/95 shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-primary/12 bg-primary/8 p-3 shadow-sm">
              <Icon className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">{title}</h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px]",
                    enabled
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-border/70 bg-muted/40 text-muted-foreground"
                  )}
                >
                  {enabled ? "Active" : "Disabled"}
                </Badge>
              </div>
              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="flex h-full min-h-24 items-center justify-end">
            <div className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm lg:max-w-[170px]">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium">{enabled ? "On" : "Off"}</p>
              </div>
              <Switch checked={enabled} onCheckedChange={onToggle} />
            </div>
          </div>
        </div>

        {enabled && children ? <div className="mt-5">{children}</div> : null}
      </CardContent>
    </Card>
  );
}
