"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import ProfileImageUpload from "@/components/images-upload/profile-image-upload";
import useSignUp from "../../hooks/use-sign-up";
import { GoogleButton, OrDivider } from "../google-button";

type StepKey = "account" | "contact" | "security";

const STEP_FIELDS: Record<
  StepKey,
  ("name" | "image" | "email" | "phone" | "password")[]
> = {
  account: ["name", "image"],
  contact: ["email", "phone"],
  security: ["password"],
};

function passwordStrength(password: string): {
  score: number;
  label: string;
  className: string;
} {
  if (!password) {
    return { score: 0, label: "", className: "bg-muted" };
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", className: "bg-destructive" };
  if (score <= 3) return { score, label: "Fair", className: "bg-chart-3" };
  if (score === 4) return { score, label: "Good", className: "bg-chart-1" };
  return { score, label: "Strong", className: "bg-chart-5" };
}

export default function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("modules.auth.signUp");
  const { error, onSubmit, isPending, form } = useSignUp();

  const steps: (StepperStep & { key: StepKey })[] = useMemo(
    () => [
      {
        id: "account",
        key: "account",
        title: t("steps.account.title", { defaultValue: "Account" }),
        description: t("steps.account.description", {
          defaultValue: "Your name & avatar",
        }),
        icon: User,
      },
      {
        id: "contact",
        key: "contact",
        title: t("steps.contact.title", { defaultValue: "Contact" }),
        description: t("steps.contact.description", {
          defaultValue: "Email & phone",
        }),
        icon: Mail,
      },
      {
        id: "security",
        key: "security",
        title: t("steps.security.title", { defaultValue: "Security" }),
        description: t("steps.security.description", {
          defaultValue: "Password",
        }),
        icon: ShieldCheck,
      },
    ],
    [t],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [highest, setHighest] = useState(0);
  const currentStep = steps[stepIndex]!;
  const isLastStep = stepIndex === steps.length - 1;
  const isFirstStep = stepIndex === 0;

  const password = form.watch("password") ?? "";
  const strength = passwordStrength(password);

  const goNext = async () => {
    const fields = STEP_FIELDS[currentStep.key];
    const valid = await form.trigger(fields, { shouldFocus: true });
    if (!valid) return;
    if (!isLastStep) {
      const next = stepIndex + 1;
      setStepIndex(next);
      setHighest((prev) => Math.max(prev, next));
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleStepClick = (index: number) => {
    if (index <= highest) setStepIndex(index);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLastStep) {
      void goNext();
      return;
    }
    void form.handleSubmit(onSubmit)();
  };

  return (
    <div className={cn("w-full space-y-6", className)} {...props}>
      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("title", { defaultValue: "Create your account" })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("description", {
            defaultValue: "Just a few quick steps and you're in.",
          })}
        </p>
      </div>

      {/* Stepper */}
      <Stepper
        steps={steps}
        current={stepIndex}
        highest={highest}
        onStepClick={handleStepClick}
      />

      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          {/* Step 1: Account */}
          {currentStep.key === "account" && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/30 p-4">
                <ProfileImageUpload inputName="image" />
                <FormField
                  control={form.control}
                  name="image"
                  render={() => <FormMessage />}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("steps.account.imageHint", {
                    defaultValue:
                      "JPG, PNG or WEBP. Used as your profile avatar.",
                  })}
                </p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">
                      {t("fields.fullName.label")}
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="name"
                          autoComplete="name"
                          className="pr-10"
                          placeholder={t("fields.fullName.placeholder")}
                          disabled={isPending}
                          {...field}
                        />
                        <User
                          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                          aria-hidden="true"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Contact */}
          {currentStep.key === "contact" && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t("fields.email.label")}
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          className="pr-10"
                          placeholder={t("fields.email.placeholder")}
                          disabled={isPending}
                          {...field}
                        />
                        <Mail
                          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                          aria-hidden="true"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      {t("fields.phone.label")}
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="phone"
                          autoComplete="tel"
                          className="pr-10"
                          placeholder={t("fields.phone.placeholder")}
                          disabled={isPending}
                          {...field}
                        />
                        <Phone
                          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                          aria-hidden="true"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Security */}
          {currentStep.key === "security" && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium">
                      {t("fields.password.label")}
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                          aria-hidden="true"
                        />
                        <Input
                          id="password"
                          type="password"
                          isPasswordInput
                          autoComplete="new-password"
                          className="pl-9"
                          placeholder={t("fields.password.placeholder")}
                          disabled={isPending}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password strength meter */}
              {password ? (
                <div className="space-y-1.5">
                  <div className="flex h-1.5 gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 rounded-full transition-colors",
                          i < strength.score ? strength.className : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      {t("steps.security.strengthLabel", {
                        defaultValue: "Password strength",
                      })}
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        strength.score <= 1
                          ? "text-destructive"
                          : strength.score <= 3
                            ? "text-chart-3"
                            : strength.score === 4
                              ? "text-chart-1"
                              : "text-chart-5",
                      )}
                    >
                      {strength.label}
                    </span>
                  </div>
                </div>
              ) : null}

              <ul className="grid gap-1.5 text-[11px] text-muted-foreground sm:grid-cols-2">
                <PasswordRule
                  ok={password.length >= 8}
                  label={t("steps.security.rules.length", {
                    defaultValue: "At least 8 characters",
                  })}
                />
                <PasswordRule
                  ok={/[A-Z]/.test(password)}
                  label={t("steps.security.rules.uppercase", {
                    defaultValue: "One uppercase letter",
                  })}
                />
                <PasswordRule
                  ok={/[0-9]/.test(password)}
                  label={t("steps.security.rules.number", {
                    defaultValue: "One number",
                  })}
                />
                <PasswordRule
                  ok={/[^A-Za-z0-9]/.test(password)}
                  label={t("steps.security.rules.special", {
                    defaultValue: "One symbol",
                  })}
                />
              </ul>
            </div>
          )}

          {error ? (
            <Alert variant="destructive" className="text-sm">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {/* Step navigation */}
          <div className="flex items-center gap-2 pt-1">
            {!isFirstStep ? (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={isPending}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 size-4" />
                {t("actions.back", { defaultValue: "Back" })}
              </Button>
            ) : null}
            <Button
              type="submit"
              disabled={isPending}
              className={cn("flex-1", isFirstStep && "w-full")}
            >
              {!isLastStep ? (
                <>
                  {t("actions.next", { defaultValue: "Continue" })}
                  <ArrowRight className="ml-2 size-4" />
                </>
              ) : isPending ? (
                t("actions.signingUp")
              ) : (
                <>
                  <Check className="mr-2 size-4" />
                  {t("actions.signup")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Google option only on the first step (matches reference UX) */}
      {isFirstStep ? (
        <>
          <OrDivider
            label={t("orContinueWith", { defaultValue: "Or continue with" })}
          />
          <GoogleButton
            label={t("actions.continueWithGoogle", {
              defaultValue: "Continue with Google",
            })}
            disabled={isPending}
          />
        </>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          {t("actions.login")}
        </Link>
      </p>
    </div>
  );
}

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={cn(
        "inline-flex items-center gap-1.5",
        ok ? "text-chart-5" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "flex size-3.5 items-center justify-center rounded-full border",
          ok
            ? "border-chart-5 bg-chart-5/10 text-chart-5"
            : "border-border bg-background text-transparent",
        )}
        aria-hidden="true"
      >
        <Check className="size-2.5" strokeWidth={3} />
      </span>
      {label}
    </li>
  );
}
