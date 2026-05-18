"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Palette, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark"], {
    required_error: "Please select a theme."
  })
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

/* ─── Section heading ─────────────────────────────────────────────── */
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

export default function PlatformAppearanceChangement() {
  const t = useTranslations("shared.theme");
  const { theme, setTheme } = useTheme();

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: (theme as "light" | "dark") || "light"
    }
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm">
      <Form {...form}>
        <form className="grid min-h-0 gap-0 lg:grid-cols-[300px_1fr]">

          {/* ══ LEFT: Theme info panel ══════════════════════════════════ */}
          <aside className="flex flex-col gap-6 border-r border-border/50 bg-muted/15 p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <Palette className="h-8 w-8 text-primary" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Theme & Identity</p>
                <p className="text-xs text-muted-foreground">
                  Customize the interface to match your environment and reduce eye strain.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
              <p className="mb-3 text-xs font-semibold text-foreground">Current settings</p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span className="text-[11px] leading-relaxed text-muted-foreground">
                    Instantly applies to all workspace panels
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span className="text-[11px] leading-relaxed text-muted-foreground">
                    Saves locally to your device
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span className="text-[11px] leading-relaxed text-muted-foreground">
                    Affects data visualizations and charts
                  </span>
                </li>
              </ul>
            </div>
          </aside>

          {/* ══ RIGHT: Form fields ════════════════════════════════════ */}
          <main className="flex flex-col gap-8 p-8">
            <section>
              <SectionHeading icon={Sparkles} label={t("changement.title")} />
              <p className="mb-6 text-sm text-muted-foreground">{t("changement.subtitle")}</p>

              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          setTheme(value);
                          field.onChange(value);
                        }}
                        defaultValue={field.value}
                        className="grid max-w-md grid-cols-2 gap-8 pt-2"
                      >
                        {/* Light Mode Option */}
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary flex-col cursor-pointer">
                            <FormControl>
                              <RadioGroupItem value="light" className="sr-only" />
                            </FormControl>
                            <div className="items-center rounded-lg border-2 border-border/50 hover:border-primary/50 transition-colors p-1">
                              <div className="space-y-2 rounded-lg bg-[#ecedef] p-2">
                                <div className="space-y-2 rounded-md bg-white p-2 shadow-xs">
                                  <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                </div>
                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                                  <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                </div>
                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                                  <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                </div>
                              </div>
                            </div>
                            <span className="block w-full p-2 text-center font-medium">
                              {t("light")}
                            </span>
                          </FormLabel>
                        </FormItem>

                        {/* Dark Mode Option */}
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary flex-col cursor-pointer">
                            <FormControl>
                              <RadioGroupItem value="dark" className="sr-only" />
                            </FormControl>
                            <div className="items-center rounded-lg border-2 border-border/50 bg-popover hover:border-primary/50 transition-colors p-1">
                              <div className="space-y-2 rounded-lg bg-slate-950 p-2">
                                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-xs">
                                  <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                </div>
                                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs">
                                  <div className="h-4 w-4 rounded-full bg-slate-400" />
                                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                </div>
                                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs">
                                  <div className="h-4 w-4 rounded-full bg-slate-400" />
                                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                </div>
                              </div>
                            </div>
                            <span className="block w-full p-2 text-center font-medium">
                              {t("dark")}
                            </span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </section>

            {/* Save indicator bar */}
            <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 px-5 py-4">
              <p className="text-xs text-muted-foreground">
                Your theme preferences are saved and applied automatically.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Live sync enabled
              </div>
            </div>
          </main>
        </form>
      </Form>
    </div>
  );
}
