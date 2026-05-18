"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LanguageSelector from "@/components/layout/header/language-selector";
import { useEffect } from "react";
import ProfileImageUpload from "@/components/images-upload/profile-image-upload";
import useUser from "../../hooks/users/use-user";
import useUserInfoChangement from "../../hooks/users/user-info-changement";
import { useLanguages } from "@/hooks/use-languages";
import { getProfileCompletionSummary } from "@/modules/users/utils/profile-completion";
import { CheckCircle2, Circle, Clock, Globe, Lock, Save, User } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Field status header ─────────────────────────────────────────── */
function FieldHeader({
  label,
  status,
}: {
  label: string;
  status: "complete" | "missing" | "optional" | "locked";
}) {
  const badge = {
    complete:  { text: "Complete",     className: "text-primary" },
    missing:   { text: "Missing info", className: "text-destructive" },
    optional:  { text: "Optional",     className: "text-muted-foreground" },
    locked:    { text: "Locked",       className: "text-muted-foreground" },
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

/* ─── Input with trailing icon ────────────────────────────────────── */
function StatusInput({
  status,
  children,
}: {
  status: "complete" | "missing" | "optional" | "locked";
  children: React.ReactNode;
}) {
  const icon = {
    complete: <CheckCircle2 className="h-4 w-4 text-primary" />,
    missing:  <Clock className="h-4 w-4 text-destructive" />,
    optional: null,
    locked:   <Lock className="h-4 w-4 text-muted-foreground" />,
  }[status];

  const ringClass = {
    complete: "ring-1 ring-primary/30 focus-within:ring-primary/60",
    missing:  "ring-1 ring-destructive/30 focus-within:ring-destructive/60",
    optional: "focus-within:ring-1 focus-within:ring-ring/50",
    locked:   "",
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

/* ─── Main component ──────────────────────────────────────────────── */
export default function PersonalInfoChangement() {
  const { user } = useUser();
  const { form, onSubmit, isPending } = useUserInfoChangement({ user });
  const t = useTranslations("modules.auth.account.personalInfoChangement");
  const { languages } = useLanguages();

  useEffect(() => {
    if (user) {
      form.reset({ fullName: user.name, phone: user.phone, imageUrl: user.image });
    }
  }, [user, form]);

  const nameValue  = form.watch("fullName");
  const phoneValue = form.watch("phone");
  const nameStatus  = nameValue?.trim()  ? "complete" : "missing";
  const phoneStatus = phoneValue?.trim() ? "complete" : "optional";
  const emailStatus = user?.email        ? "locked"   : "missing";

  const summary = user ? getProfileCompletionSummary(user) : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* ── Two-column hero layout ── */}
        <div className="grid min-h-0 gap-0 lg:grid-cols-[300px_1fr]">

          {/* ══ LEFT: Identity panel ══════════════════════════════════ */}
          <aside className="flex flex-col items-center gap-6 border-r border-border/50 bg-muted/15 p-8">

            {/* Avatar + ring */}
            <div className="flex flex-col items-center gap-3">
              <ProfileImageUpload
                defaultImageUrl={form.watch("imageUrl")}
                defaultImageUrlInputName="imageUrl"
                inputName="image"
                completionPercentage={summary?.percentage ?? 0}
              />
              {user?.name && (
                <div className="text-center">
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>

            {/* Completion checklist — only shown when not yet 100% */}
            {summary && summary.percentage < 100 && (
              <div className="w-full rounded-2xl border border-border/50 bg-background/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Profile strength</span>
                  <span className={cn(
                    "text-xs font-bold",
                    summary.percentage === 100 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {summary.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-border/50">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${summary.percentage}%` }}
                  />
                </div>

                <ul className="space-y-2.5">
                  {summary.items.map((item) => (
                    <li key={item.key} className="flex items-center gap-2.5">
                      {item.complete ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-border" />
                      )}
                      <span className={cn(
                        "text-xs",
                        item.complete ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Helper text */}
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              A complete profile helps teammates recognize and reach you across all projects.
            </p>
          </aside>

          {/* ══ RIGHT: Form fields ════════════════════════════════════ */}
          <main className="flex flex-col gap-8 p-8">

            {/* ── Identity section ── */}
            <section>
              <SectionHeading icon={User} label="Personal details" />
              <div className="grid gap-5 sm:grid-cols-2">

                {/* Full name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FieldHeader label={t("fields.name.label")} status={nameStatus} />
                      <FormControl>
                        <StatusInput status={nameStatus}>
                          <Input
                            placeholder={t("fields.name.placeholder")}
                            className="h-10 pr-10 transition-all duration-200"
                            {...field}
                          />
                        </StatusInput>
                      </FormControl>
                      <FormDescription className="mt-1.5 text-xs">
                        {t("fields.name.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FieldHeader label={t("fields.phone.label")} status={phoneStatus} />
                      <FormControl>
                        <StatusInput status={phoneStatus}>
                          <Input
                            placeholder={t("fields.phone.placeholder")}
                            className="h-10 pr-10 transition-all duration-200"
                            {...field}
                          />
                        </StatusInput>
                      </FormControl>
                      <FormDescription className="mt-1.5 text-xs">
                        Add a direct number for a more complete profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email — locked, full width */}
                <FormItem className="space-y-0 sm:col-span-2">
                  <FieldHeader label={t("fields.email.label")} status={emailStatus} />
                  <FormControl>
                    <StatusInput status={emailStatus}>
                      <Input
                        placeholder={t("fields.email.placeholder")}
                        value={user ? user.email : ""}
                        disabled
                        className="h-10 pr-10 opacity-60 transition-all duration-200"
                      />
                    </StatusInput>
                  </FormControl>
                  <FormDescription className="mt-1.5 text-xs">
                    {t("fields.email.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </div>
            </section>

            {/* ── Language section ── */}
            {languages && languages.length > 1 && (
              <section>
                <SectionHeading icon={Globe} label={t("fields.language.label")} />
                <LanguageSelector />
              </section>
            )}

            {/* ── Save bar ── */}
            <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 px-5 py-4">
              <p className="text-xs text-muted-foreground">
                {isPending
                  ? "Saving your changes…"
                  : "Changes are saved to your account immediately."}
              </p>
              <Button type="submit" disabled={isPending} className="gap-2 px-6">
                <Save className="h-4 w-4" />
                {isPending ? t("actions.updating") : t("actions.update")}
              </Button>
            </div>
          </main>
        </div>
      </form>
    </Form>
  );
}

