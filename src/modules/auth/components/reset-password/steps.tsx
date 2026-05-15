"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type React from "react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@/i18n/navigation";

import { useResetPasswordStore } from "../../store/reset-password-store";

type StepKey = "email" | "code" | "password";

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

export default function ResetPasswordSteps({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("modules.auth.resetPassword");
  const tValidations = useTranslations("modules.auth.validations");
  const tErrors = useTranslations("modules.auth.errors");
  const router = useRouter();

  const {
    step,
    email,
    setEmail,
    code,
    setCode,
    password,
    setPassword,
    confirmationPassword,
    setConfirmationPassword,
    warning,
    passwordWarning,
    submitEmail,
    submitCode,
    submitPassword,
    displayedTimer,
    timeLeft,
    isLoading,
    setStep,
    startTimer,
    resetTimer,
  } = useResetPasswordStore();

  const steps: (StepperStep & { key: StepKey })[] = useMemo(
    () => [
      {
        id: "email",
        key: "email",
        title: t("steps.email.label", { defaultValue: "Email" }),
        description: t("steps.email.description", {
          defaultValue: "Where we send the code",
        }),
        icon: Mail,
      },
      {
        id: "code",
        key: "code",
        title: t("steps.otp.title", { defaultValue: "Verification" }),
        description: t("steps.otp.label", { defaultValue: "Enter the code" }),
        icon: KeyRound,
      },
      {
        id: "password",
        key: "password",
        title: t("steps.newPassword.title", { defaultValue: "New password" }),
        description: t("steps.newPassword.description", {
          defaultValue: "Choose a strong password",
        }),
        icon: ShieldCheck,
      },
    ],
    [t],
  );

  const currentStepIndex = useMemo(() => {
    const idx = steps.findIndex((s) => s.key === step);
    return idx >= 0 ? idx : 0;
  }, [step, steps]);

  const currentStep = steps[currentStepIndex]!;
  const isLastStep = currentStepIndex === steps.length - 1;

  const [highest, setHighest] = useState(currentStepIndex);

  useEffect(() => {
    setHighest((h) => Math.max(h, currentStepIndex));
  }, [currentStepIndex]);

  const pageTitle = useMemo(() => {
    if (currentStep.key === "email")
      return t("title", { defaultValue: "Forgot password" });
    if (currentStep.key === "code")
      return t("steps.otp.title", { defaultValue: "Enter verification code" });
    return t("steps.newPassword.title", { defaultValue: "Set a new password" });
  }, [currentStep.key, t]);

  const pageSubtitle = useMemo(() => {
    if (currentStep.key === "email")
      return t("description", {
        defaultValue:
          "Enter your email and we'll send you a code to reset your password.",
      });
    if (currentStep.key === "code")
      return t("steps.otp.description", {
        defaultValue: "Enter the 5-character code we sent to your email.",
      });
    return t("steps.newPassword.description", {
      defaultValue: "Enter your new password below.",
    });
  }, [currentStep.key, t]);

  const goNext = async () => {
    if (currentStep.key === "email") {
      await submitEmail(tValidations);
      return;
    }
    if (currentStep.key === "code") {
      if (code.length !== 5) return;
      await submitCode(tErrors);
      return;
    }
    if (currentStep.key === "password") {
      const success = await submitPassword(tValidations);
      if (success) router.push("/login");
    }
  };

  const goBack = () => {
    if (currentStepIndex <= 0) return;
    const prev = steps[currentStepIndex - 1]?.key;
    if (prev) setStep(prev);
  };

  const handleStepClick = (index: number) => {
    if (index <= highest) {
      const target = steps[index]?.key;
      if (target) setStep(target);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    resetTimer();
    setCode("");
    await submitEmail(tValidations);
    if (useResetPasswordStore.getState().step === "code") startTimer();
  };

  const primaryLabel = () => {
    if (currentStep.key === "email")
      return isLoading
        ? t("steps.email.button.loading", { defaultValue: "Sending..." })
        : t("steps.email.button.default", { defaultValue: "Send code" });
    if (currentStep.key === "code")
      return isLoading
        ? t("steps.otp.button.loading", { defaultValue: "Verifying..." })
        : t("steps.otp.button.default", { defaultValue: "Verify code" });
    return isLoading
      ? t("steps.newPassword.button.loading", { defaultValue: "Resetting..." })
      : t("steps.newPassword.button.default", { defaultValue: "Reset password" });
  };

  const strength = passwordStrength(password);

  // Avoid duplicate error rendering: only show inline email error when the
  // Alert isn't already showing the same message.
  const showInlineEmailWarning =
    !!warning.email && warning.email !== warning.generalWarning;

  return (
    <div className={cn("w-full space-y-6", className)} {...props}>
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="text-sm text-muted-foreground">{pageSubtitle}</p>
      </div>

      <Stepper
        steps={steps}
        current={currentStepIndex}
        highest={highest}
        onStepClick={handleStepClick}
      />

      <div className="space-y-4">
        {currentStep.key === "email" && (
          <div className="space-y-1.5">
            <Label htmlFor="reset-email" className="text-sm font-medium">
              {t("fields.email.label", { defaultValue: "Email address" })}
            </Label>
            <div className="relative">
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                className="pr-10"
                placeholder={t("fields.email.placeholder", {
                  defaultValue: "name@company.com",
                })}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <Mail
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                aria-hidden="true"
              />
            </div>
            {showInlineEmailWarning ? (
              <p className="text-sm text-destructive">{warning.email}</p>
            ) : null}
          </div>
        )}

        {currentStep.key === "code" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("steps.otp.label", { defaultValue: "Verification code" })}
              </Label>
              {email ? (
                <p className="text-xs text-muted-foreground">
                  {t("steps.otp.sentTo", {
                    defaultValue: "We sent a 5-character code to",
                  })}{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              ) : null}
            </div>
            <div className="flex justify-center py-1">
              <InputOTP
                maxLength={5}
                value={code}
                onChange={setCode}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                disabled={isLoading}
              >
                <InputOTPGroup className="gap-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <InputOTPSlot
                      key={idx}
                      index={idx}
                      className="size-11 rounded-md border-border text-base sm:size-12 sm:text-lg"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              {timeLeft > 0 ? (
                <>
                  <span>
                    {t("steps.otp.timer", { defaultValue: "Code expires in" })}
                  </span>
                  <span className="font-medium tabular-nums text-foreground">
                    {displayedTimer}
                  </span>
                </>
              ) : (
                <span>
                  {t("steps.otp.expired", {
                    defaultValue: "Code expired.",
                  })}
                </span>
              )}
              <span aria-hidden className="text-muted-foreground/50">
                ·
              </span>
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={isLoading || timeLeft > 0}
                className={cn(
                  "inline-flex items-center gap-1 font-medium underline-offset-4 transition-colors",
                  timeLeft > 0 || isLoading
                    ? "cursor-not-allowed text-muted-foreground/60"
                    : "text-primary hover:underline",
                )}
              >
                <RefreshCw
                  className={cn(
                    "size-3",
                    isLoading && "animate-spin",
                  )}
                />
                {t("steps.otp.resend", { defaultValue: "Resend code" })}
              </button>
            </div>
          </div>
        )}

        {currentStep.key === "password" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reset-password" className="text-sm font-medium">
                {t("steps.newPassword.passwordLabel", {
                  defaultValue: "New password",
                })}
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                  aria-hidden="true"
                />
                <Input
                  id="reset-password"
                  type="password"
                  isPasswordInput
                  autoComplete="new-password"
                  className="pl-9"
                  placeholder={t("steps.newPassword.passwordPlaceholder", {
                    defaultValue: "••••••••",
                  })}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {passwordWarning.password ? (
                <p className="text-sm text-destructive">
                  {passwordWarning.password}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reset-password-confirm"
                className="text-sm font-medium"
              >
                {t("steps.newPassword.confirmPasswordLabel", {
                  defaultValue: "Confirm new password",
                })}
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                  aria-hidden="true"
                />
                <Input
                  id="reset-password-confirm"
                  type="password"
                  isPasswordInput
                  autoComplete="new-password"
                  className="pl-9"
                  placeholder={t(
                    "steps.newPassword.confirmPasswordPlaceholder",
                    { defaultValue: "••••••••" },
                  )}
                  value={confirmationPassword}
                  onChange={(e) => setConfirmationPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {passwordWarning.confirmationPassword ? (
                <p className="text-sm text-destructive">
                  {passwordWarning.confirmationPassword}
                </p>
              ) : null}
            </div>

            {/* Strength meter — matches sign-up */}
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
                    {t("steps.newPassword.strengthLabel", {
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
                label={t("steps.newPassword.rules.length", {
                  defaultValue: "At least 8 characters",
                })}
              />
              <PasswordRule
                ok={/[A-Z]/.test(password)}
                label={t("steps.newPassword.rules.uppercase", {
                  defaultValue: "One uppercase letter",
                })}
              />
              <PasswordRule
                ok={/[0-9]/.test(password)}
                label={t("steps.newPassword.rules.number", {
                  defaultValue: "One number",
                })}
              />
              <PasswordRule
                ok={/[^A-Za-z0-9]/.test(password)}
                label={t("steps.newPassword.rules.special", {
                  defaultValue: "One symbol",
                })}
              />
            </ul>
          </div>
        )}

        {(warning.generalWarning || passwordWarning.generalWarning) && (
          <Alert variant="destructive" className="text-sm">
            <AlertCircle className="size-4" />
            <AlertDescription>
              {warning.generalWarning || passwordWarning.generalWarning}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {currentStepIndex > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={isLoading}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 size-4" />
            {t("actions.back", { defaultValue: "Back" })}
          </Button>
        ) : null}
        <Button
          type="button"
          disabled={
            isLoading || (currentStep.key === "code" && code.length < 5)
          }
          className={cn("flex-1", currentStepIndex === 0 && "w-full")}
          onClick={() => void goNext()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {primaryLabel()}
            </>
          ) : isLastStep ? (
            <>
              <Check className="mr-2 size-4" />
              {primaryLabel()}
            </>
          ) : (
            <>
              {primaryLabel()}
              <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t("rememberPassword", { defaultValue: "Remember your password?" })}{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          {t("comebackButton", { defaultValue: "Sign in" })}
        </Link>
      </p>
    </div>
  );
}
