"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type React from "react";
import Link from "next/link";
import { AlertCircle, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import useSignIn from "../../hooks/use-sign-in";
import { GoogleButton, OrDivider } from "../google-button";

export default function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("modules.auth.signIn");
  const { error, onSubmit, isPending, form } = useSignIn();
  const [remember, setRemember] = useState(true);

  return (
    <div className={cn("w-full space-y-6", className)} {...props}>
      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("welcomeBack", { defaultValue: "Welcome back" })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("welcomeSubtitle", {
            defaultValue: "Please enter your details to sign in.",
          })}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t("fields.email.label", { defaultValue: "Email address" })}
                </Label>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="pr-10"
                      placeholder={t("fields.email.placeholder", {
                        defaultValue: "name@company.com",
                      })}
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
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t("fields.password.label", { defaultValue: "Password" })}
                </Label>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    isPasswordInput
                    autoComplete="current-password"
                    placeholder={t("fields.password.placeholder")}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={remember}
                onCheckedChange={(v) => setRemember(!!v)}
                aria-label={t("rememberMe", { defaultValue: "Remember me" })}
              />
              <span>{t("rememberMe", { defaultValue: "Remember me" })}</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-destructive underline-offset-4 hover:underline"
            >
              {t("fields.password.forgot", {
                defaultValue: "Forgot password?",
              })}
            </Link>
          </div>

          {/* Error */}
          {error ? (
            <Alert variant="destructive" className="text-sm">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? t("actions.loggingIn")
              : t("actions.signIn", { defaultValue: "Sign In" })}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <OrDivider
        label={t("orContinueWith", { defaultValue: "Or continue with" })}
      />

      <GoogleButton
        label={t("actions.continueWithGoogle", {
          defaultValue: "Continue with Google",
        })}
        disabled={isPending}
      />

      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount", { defaultValue: "Don't have an account?" })}{" "}
        <Link
          href="/register"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          {t("actions.signUpForFree", { defaultValue: "Sign up for free" })}
        </Link>
      </p>
    </div>
  );
}
