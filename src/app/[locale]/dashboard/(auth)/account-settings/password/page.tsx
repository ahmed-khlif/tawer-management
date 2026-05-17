"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import usePasswordChangement from "@/modules/auth/hooks/users/use-password-changement";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import { KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("modules.auth.account.passwordChangement");
  const { form, submitPassword, isLoading } = usePasswordChangement();

  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={KeyRound}
        title="Password & Security"
        description="Update your workspace credentials with the same polished security controls used across the platform."
        metrics={[
          { icon: LockKeyhole, label: "Password update", tone: "primary" },
          { icon: ShieldCheck, label: "Secure account flow", tone: "success" },
        ]}
      />
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitPassword)} className="space-y-8">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("currentPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        isPasswordInput
                        type="password"
                        placeholder={t("currentPasswordPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t("currentPasswordDescription")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("newPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        isPasswordInput
                        type="password"
                        placeholder={t("newPasswordPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t("newPasswordDescription")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmationPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("confirmationPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        isPasswordInput
                        type="password"
                        placeholder={t("confirmationPasswordPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t("confirmationPasswordDescription")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("updatingButton") : t("updateButton")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
