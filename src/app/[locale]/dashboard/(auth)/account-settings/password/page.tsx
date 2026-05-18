"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import usePasswordChangement from "@/modules/auth/hooks/users/use-password-changement";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import { CheckCircle2, KeyRound, Lock, LockKeyhole, Save, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";

/* ─── Field label + status badge ─────────────────────────────────── */
function FieldHeader({
  label,
  status,
}: {
  label: string;
  status: "filled" | "empty";
}) {
  const badge = {
    filled: { text: "Entered",  className: "text-primary" },
    empty:  { text: "Required", className: "text-destructive" },
  }[status];

  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-[10px] font-semibold uppercase tracking-widest", badge.className)}>
        {badge.text}
      </span>
    </div>
  );
}

/* ─── Input wrapper with trailing status icon ────────────────────── */
function StatusInput({
  status,
  isPassword,
  children,
}: {
  status: "filled" | "empty";
  isPassword?: boolean;
  children: React.ReactNode;
}) {
  const ringClass = {
    filled: "ring-1 ring-primary/30 focus-within:ring-primary/60",
    empty:  "focus-within:ring-1 focus-within:ring-ring/50",
  }[status];

  return (
    <div className={cn("relative rounded-lg transition-shadow duration-200", ringClass)}>
      {children}
      {status === "filled" && !isPassword && (
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
        </span>
      )}
    </div>
  );
}

/* ─── Section heading with icon + divider ────────────────────────── */
function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-5">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="ml-2 h-px flex-1 bg-border/60" />
    </div>
  );
}

const TIPS = [
  "Use at least 8 characters",
  "Mix uppercase and lowercase letters",
  "Add numbers and special characters",
  "Avoid personal info or common words",
  "Don't reuse passwords from other accounts",
];

/* ─── Main page ──────────────────────────────────────────────────── */
export default function Page() {
  const t = useTranslations("modules.auth.account.passwordChangement");
  const { form, submitPassword, isLoading } = usePasswordChangement();

  const currentVal = useWatch({ control: form.control, name: "currentPassword" });
  const newVal     = useWatch({ control: form.control, name: "newPassword" });
  const confirmVal = useWatch({ control: form.control, name: "confirmationPassword" });

  /* Strength score 0–4 */
  const strength = (() => {
    if (!newVal) return 0;
    let s = 0;
    if (newVal.length >= 8)           s++;
    if (/[A-Z]/.test(newVal))         s++;
    if (/[0-9]/.test(newVal))         s++;
    if (/[^A-Za-z0-9]/.test(newVal))  s++;
    return s;
  })();

  const strengthMeta = [
    null,
    { label: "Weak",   bar: "bg-destructive" },
    { label: "Fair",   bar: "bg-yellow-500"  },
    { label: "Good",   bar: "bg-blue-500"    },
    { label: "Strong", bar: "bg-primary"     },
  ];
  const meta = strengthMeta[strength];

  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={KeyRound}
        title="Password & Security"
        description="Update your workspace credentials with the same polished security controls used across the platform."
        metrics={[
          { icon: LockKeyhole, label: "Password update",   tone: "primary" },
          { icon: ShieldCheck, label: "Secure account flow", tone: "success" },
        ]}
      />

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitPassword)}>
            <div className="grid min-h-0 gap-0 lg:grid-cols-[300px_1fr]">

              {/* ══ LEFT: Security panel ════════════════════════════ */}
              <aside className="flex flex-col gap-6 border-r border-border/50 bg-muted/15 p-8">

                {/* Icon + heading */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Password security</p>
                    <p className="text-xs text-muted-foreground">
                      Keep your account safe with a strong, unique password.
                    </p>
                  </div>
                </div>

                {/* Live strength meter */}
                {newVal ? (
                  <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Password strength</span>
                      {meta && (
                        <span className={cn(
                          "text-xs font-bold",
                          strength >= 4 ? "text-primary"      :
                          strength >= 3 ? "text-blue-500"     :
                          strength >= 2 ? "text-yellow-500"   : "text-destructive"
                        )}>
                          {meta.label}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-500",
                            meta && i <= strength ? meta.bar : "bg-border/50"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Password strength</span>
                      <span className="text-xs text-muted-foreground">—</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-1.5 flex-1 rounded-full bg-border/40" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Security tips */}
                <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                  <p className="mb-3 text-xs font-semibold text-foreground">Tips for a strong password</p>
                  <ul className="space-y-2.5">
                    {TIPS.map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/50" />
                        <span className="text-[11px] leading-relaxed text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              {/* ══ RIGHT: Form ══════════════════════════════════════ */}
              <main className="flex flex-col gap-8 p-8">
                <section>
                  <SectionHeading icon={KeyRound} label="Change password" />
                  <div className="grid gap-5">

                    {/* Current password */}
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FieldHeader
                            label={t("currentPassword")}
                            status={currentVal?.trim() ? "filled" : "empty"}
                          />
                          <FormControl>
                            <StatusInput status={currentVal?.trim() ? "filled" : "empty"} isPassword>
                              <Input
                                isPasswordInput
                                type="password"
                                placeholder={t("currentPasswordPlaceholder")}
                                className={cn("h-10 transition-all duration-200", currentVal?.trim() ? "pr-10" : "")}
                                {...field}
                              />
                            </StatusInput>
                          </FormControl>
                          <FormDescription className="mt-1.5 text-xs">
                            {t("currentPasswordDescription")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="h-px bg-border/40" />

                    {/* New password */}
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FieldHeader
                            label={t("newPassword")}
                            status={newVal?.trim() ? "filled" : "empty"}
                          />
                          <FormControl>
                            <StatusInput status={newVal?.trim() ? "filled" : "empty"} isPassword>
                              <Input
                                isPasswordInput
                                type="password"
                                placeholder={t("newPasswordPlaceholder")}
                                className={cn("h-10 transition-all duration-200", newVal?.trim() ? "pr-10" : "")}
                                {...field}
                              />
                            </StatusInput>
                          </FormControl>
                          <FormDescription className="mt-1.5 text-xs">
                            {t("newPasswordDescription")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirm password */}
                    <FormField
                      control={form.control}
                      name="confirmationPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FieldHeader
                            label={t("confirmationPassword")}
                            status={confirmVal?.trim() ? "filled" : "empty"}
                          />
                          <FormControl>
                            <StatusInput status={confirmVal?.trim() ? "filled" : "empty"} isPassword>
                              <Input
                                isPasswordInput
                                type="password"
                                placeholder={t("confirmationPasswordPlaceholder")}
                                className={cn("h-10 transition-all duration-200", confirmVal?.trim() ? "pr-10" : "")}
                                {...field}
                              />
                            </StatusInput>
                          </FormControl>
                          <FormDescription className="mt-1.5 text-xs">
                            {t("confirmationPasswordDescription")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Save bar */}
                <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 px-5 py-4">
                  <p className="text-xs text-muted-foreground">
                    {isLoading
                      ? "Updating your password…"
                      : "You'll be signed out of other sessions after changing your password."}
                  </p>
                  <Button type="submit" disabled={isLoading} className="gap-2 px-6">
                    <Save className="h-4 w-4" />
                    {isLoading ? t("updatingButton") : t("updateButton")}
                  </Button>
                </div>
              </main>
            </div>
          </form>
        </Form>
      </div>
    </AdminPageShell>
  );
}
