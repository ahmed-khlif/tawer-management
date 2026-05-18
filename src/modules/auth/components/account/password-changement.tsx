"use client";

import { useTranslations } from "next-intl";
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
import { CheckCircle2, KeyRound, Lock, Save, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatch } from "react-hook-form";

/* ─── Field label + status badge ─────────────────────────────────── */
function FieldHeader({
  label,
  status,
}: {
  label: string;
  status: "filled" | "empty" | "locked";
}) {
  const badge = {
    filled: { text: "Entered",  className: "text-primary" },
    empty:  { text: "Required", className: "text-destructive" },
    locked: { text: "Locked",   className: "text-muted-foreground" },
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

/* ─── Input with trailing status icon ───────────────────────────── */
function StatusInput({
  status,
  children,
}: {
  status: "filled" | "empty" | "locked";
  children: React.ReactNode;
}) {
  const icon = {
    filled: <CheckCircle2 className="h-4 w-4 text-primary" />,
    empty:  null,
    locked: <Lock className="h-4 w-4 text-muted-foreground" />,
  }[status];

  const ringClass = {
    filled: "ring-1 ring-primary/30 focus-within:ring-primary/60",
    empty:  "focus-within:ring-1 focus-within:ring-ring/50",
    locked: "",
  }[status];

  return (
    <div className={cn("relative rounded-lg transition-shadow duration-200", ringClass)}>
      {children}
      {icon && (
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
          {icon}
        </span>
      )}
    </div>
  );
}

/* ─── Section heading ─────────────────────────────────────────────── */
function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-4">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="ml-2 h-px flex-1 bg-border/60" />
    </div>
  );
}

const tips = [
  "Use at least 8 characters",
  "Mix uppercase and lowercase letters",
  "Add numbers and special characters",
  "Avoid using personal info or common words",
  "Don't reuse passwords from other accounts",
];

/* ─── Main component ──────────────────────────────────────────────── */
export default function Page() {
  const t = useTranslations("auth.account");
  const { form, submitPassword, isLoading } = usePasswordChangement();

  const currentVal      = useWatch({ control: form.control, name: "currentPassword" });
  const newVal          = useWatch({ control: form.control, name: "newPassword" });
  const confirmVal      = useWatch({ control: form.control, name: "confirmationPassword" });

  const currentStatus  = currentVal?.trim()  ? "filled" : "empty";
  const newStatus      = newVal?.trim()       ? "filled" : "empty";
  const confirmStatus  = confirmVal?.trim()   ? "filled" : "empty";

  /* Simple strength calculation */
  const strength = (() => {
    if (!newVal) return 0;
    let score = 0;
    if (newVal.length >= 8)            score++;
    if (/[A-Z]/.test(newVal))          score++;
    if (/[0-9]/.test(newVal))          score++;
    if (/[^A-Za-z0-9]/.test(newVal))  score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength] ?? "";
  const strengthColor = [
    "",
    "bg-destructive",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-primary",
  ][strength] ?? "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitPassword)}>
        <div className="grid min-h-0 gap-0 lg:grid-cols-[300px_1fr]">

          {/* ══ LEFT: Security panel ══════════════════════════════════ */}
          <aside className="flex flex-col gap-6 border-r border-border/50 bg-muted/15 p-8">

            {/* Icon + title */}
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

            {/* Strength meter — only when typing new password */}
            {newVal && (
              <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Password strength</span>
                  <span className={cn(
                    "text-xs font-bold",
                    strength >= 4 ? "text-primary" :
                    strength >= 3 ? "text-blue-500" :
                    strength >= 2 ? "text-yellow-500" : "text-destructive"
                  )}>
                    {strengthLabel}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-all duration-500",
                        i <= strength ? strengthColor : "bg-border/50"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
              <p className="mb-3 text-xs font-semibold text-foreground">Tips for a strong password</p>
              <ul className="space-y-2">
                {tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                    <span className="text-[11px] leading-relaxed text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ══ RIGHT: Form fields ════════════════════════════════════ */}
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
                      <FieldHeader label={t("currentPassword")} status={currentStatus} />
                      <FormControl>
                        <StatusInput status={currentStatus}>
                          <Input
                            type="password"
                            isPasswordInput
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
                      <FieldHeader label={t("newPassword")} status={newStatus} />
                      <FormControl>
                        <StatusInput status={newStatus}>
                          <Input
                            type="password"
                            isPasswordInput
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
                      <FieldHeader label={t("confirmationPassword")} status={confirmStatus} />
                      <FormControl>
                        <StatusInput status={confirmStatus}>
                          <Input
                            type="password"
                            isPasswordInput
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

            {/* ── Save bar ── */}
            <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 px-5 py-4">
              <p className="text-xs text-muted-foreground">
                {isLoading
                  ? "Updating your password…"
                  : "You'll be asked to log in again after changing your password."}
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
  );
}
