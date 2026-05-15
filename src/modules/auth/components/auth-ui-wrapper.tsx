"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import useExternalAuth from "../hooks/use-external-auth-validation";

interface Props {
  children: React.ReactNode;
  /**
   * Drives the hero copy on the left panel:
   *  - `signup` (default) → invitational framing for new users.
   *  - `signin` → welcome-back framing for returning users.
   *  - `reset`  → reassuring framing for password recovery.
   */
  mode?: "signup" | "signin" | "reset";
}

/**
 * Custom geometric brand mark for Tawer Management.
 * Three stacked layered cards in a rounded square — represents projects,
 * sprints, and tasks stacked into one workspace.
 *
 * Each layer has a different `auth-mark-layer-{1|2|3}` class so we can
 * stagger a subtle breathing animation on the gradient panel.
 */
function BrandMark({
  className,
  variant = "light",
  animated = false,
}: {
  className?: string;
  variant?: "light" | "dark";
  animated?: boolean;
}) {
  const stroke = variant === "light" ? "white" : "currentColor";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 8.5L12 4L20 8.5L12 13L4 8.5Z"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.9"
        className={animated ? "auth-mark-layer auth-mark-layer-1" : undefined}
      />
      <path
        d="M4 12.5L12 17L20 12.5"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.65"
        className={animated ? "auth-mark-layer auth-mark-layer-2" : undefined}
      />
      <path
        d="M4 16.5L12 21L20 16.5"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.4"
        className={animated ? "auth-mark-layer auth-mark-layer-3" : undefined}
      />
    </svg>
  );
}

export function BrandLogo({
  variant = "light",
  size = "md",
  showName = true,
  animated = false,
}: {
  variant?: "light" | "dark";
  size?: "sm" | "md";
  showName?: boolean;
  animated?: boolean;
}) {
  const tile =
    size === "sm" ? "size-8 rounded-lg" : "size-10 rounded-xl";
  const icon = size === "sm" ? "size-4" : "size-5";

  return (
    <div className="group inline-flex items-center gap-2.5">
      <div
        className={
          variant === "light"
            ? `${tile} flex items-center justify-center bg-white/15 backdrop-blur-sm transition-all duration-500 group-hover:bg-white/25 group-hover:scale-105`
            : `${tile} flex items-center justify-center bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105`
        }
      >
        <BrandMark className={icon} variant={variant} animated={animated} />
      </div>
      {showName ? (
        <span
          className={
            variant === "light"
              ? "text-base font-semibold tracking-tight text-white"
              : "text-base font-semibold tracking-tight text-foreground"
          }
        >
          Tawer Management
        </span>
      ) : null}
    </div>
  );
}

/**
 * Floating decorative SVG used in the gradient hero panel. Three sibling
 * shapes drift in slow, looping arcs to add subtle motion without distracting
 * the eye away from the form.
 */
function FloatingShapes() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Soft blurred circle, top right */}
      <circle
        cx="500"
        cy="120"
        r="64"
        fill="white"
        opacity="0.08"
        className="auth-shape auth-shape-1"
      />
      {/* Outlined ring, mid-left */}
      <circle
        cx="80"
        cy="500"
        r="46"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.08"
        className="auth-shape auth-shape-2"
      />
      {/* Diamond, bottom right */}
      <g
        opacity="0.14"
        className="auth-shape auth-shape-3"
        transform="translate(440 720)"
      >
        <path
          d="M30 0 L60 30 L30 60 L0 30 Z"
          fill="none"
          stroke="white"
          strokeWidth="1.6"
        />
      </g>
      {/* Tiny dot constellation */}
      <g className="auth-shape auth-shape-4" opacity="0.55">
        <circle cx="180" cy="220" r="1.5" fill="white" />
        <circle cx="220" cy="260" r="1.2" fill="white" />
        <circle cx="160" cy="280" r="1" fill="white" />
        <circle cx="200" cy="320" r="1.4" fill="white" />
      </g>
    </svg>
  );
}

export default function AuthUIWrapper({ children, mode = "signup" }: Props) {
  const t = useTranslations("modules.auth.authUIWrapper");
  useExternalAuth();

  // Hero copy varies by surface so the brand panel speaks to the user's intent.
  const hero = (() => {
    switch (mode) {
      case "signin":
        return {
          partA: t("hero.signin.partA", { defaultValue: "Welcome back to" }),
          highlight: t("hero.signin.highlight", { defaultValue: "your" }),
          partB: t("hero.signin.partB", { defaultValue: "workspace." }),
          subtitle: t("hero.signin.subtitle", {
            defaultValue:
              "Pick up right where you left off — your projects, sprints and reminders are waiting.",
          }),
        };
      case "reset":
        return {
          partA: t("hero.reset.partA", { defaultValue: "Let's get you" }),
          highlight: t("hero.reset.highlight", { defaultValue: "back" }),
          partB: t("hero.reset.partB", { defaultValue: "on track." }),
          subtitle: t("hero.reset.subtitle", {
            defaultValue:
              "Reset your password in a few clicks and jump back into your workspace.",
          }),
        };
      case "signup":
      default:
        return {
          partA: t("heroTitlePartA", {
            defaultValue: "Streamline your projects,",
          }),
          highlight: t("heroTitleHighlight", { defaultValue: "amplify" }),
          partB: t("heroTitlePartB", { defaultValue: "your team." }),
          subtitle: t("heroSubtitle", {
            defaultValue:
              "Experience the next evolution of project management — built for modern teams who ship fast and stay organized.",
          }),
        };
    }
  })();

  return (
    <div className="relative grid min-h-screen bg-background lg:grid-cols-2">
      {/* Scoped keyframes & motion classes — accessible (reduced-motion aware) */}
      <style>{`
        @keyframes auth-float-y {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes auth-float-x {
          0%, 100% { transform: translate(0px, 0px); }
          50%      { transform: translate(10px, -8px); }
        }
        @keyframes auth-rotate {
          0%   { transform: translate(440px, 720px) rotate(0deg); }
          100% { transform: translate(440px, 720px) rotate(360deg); }
        }
        @keyframes auth-pulse-glow {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.55; }
        }
        @keyframes auth-twinkle {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 0.15; }
        }
        @keyframes auth-mark-pulse {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50%      { transform: translateY(-1.2px); opacity: 0.92; }
        }
        @keyframes auth-mark-pulse-mid {
          0%, 100% { transform: translateY(0); opacity: 0.65; }
          50%      { transform: translateY(0.6px); opacity: 0.8; }
        }
        @keyframes auth-mark-pulse-deep {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%      { transform: translateY(1.8px); opacity: 0.6; }
        }

        @media (prefers-reduced-motion: no-preference) {
          .auth-glow-tl  { animation: auth-pulse-glow 9s ease-in-out infinite; }
          .auth-glow-br  { animation: auth-pulse-glow 11s ease-in-out infinite reverse; }

          .auth-shape-1  { transform-origin: 500px 120px; animation: auth-float-y 9s ease-in-out infinite; }
          .auth-shape-2  { transform-origin: 80px 500px;  animation: auth-float-x 12s ease-in-out infinite; }
          .auth-shape-3  { animation: auth-rotate 30s linear infinite; }
          .auth-shape-4  { animation: auth-twinkle 6s ease-in-out infinite; }

          .auth-mark-layer        { transform-origin: center; }
          .auth-mark-layer-1 { animation: auth-mark-pulse 5s ease-in-out infinite; }
          .auth-mark-layer-2 { animation: auth-mark-pulse-mid 5s ease-in-out infinite 0.4s; }
          .auth-mark-layer-3 { animation: auth-mark-pulse-deep 5s ease-in-out infinite 0.8s; }
        }
      `}</style>

      {/* ── Left: Branded hero panel ─────────────────────────────────────── */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10">
        {/* Deep → mid → lavender diagonal in the same primary hue family */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,_oklch(0.20_0.10_290)_0%,_oklch(0.32_0.14_292)_28%,_oklch(0.50_0.17_293)_60%,_oklch(0.74_0.13_295)_100%)]" />
        {/* Top-left highlight (gently breathes) */}
        <div className="auth-glow-tl pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_15%_0%,_rgba(255,255,255,0.18),_transparent_60%)]" />
        {/* Bottom-right glow (gently breathes, opposite phase) */}
        <div className="auth-glow-br pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_100%_100%,_rgba(255,255,255,0.20),_transparent_70%)]" />
        {/* Floating decorative shapes */}
        <FloatingShapes />
        {/* Subtle dotted texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Top: Logo */}
        <div className="relative z-10">
          <BrandLogo variant="light" size="md" animated />
        </div>

        {/* Middle: Hero copy + testimonial */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-white">
            {hero.partA}{" "}
            <span className="text-white/70">{hero.highlight}</span>{" "}
            {hero.partB}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
            {hero.subtitle}
          </p>

          {/* Testimonial card */}
          <div className="mt-8 max-w-sm border-t border-white/15 pt-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white backdrop-blur-sm">
                AT
              </div>
              <div className="min-w-0">
                <p className="text-sm italic leading-snug text-white/90">
                  &ldquo;
                  {t("testimonialQuote", {
                    defaultValue:
                      "Tawer transformed our delivery cadence overnight.",
                  })}
                  &rdquo;
                </p>
                <p className="mt-1 text-xs text-white/60">
                  {t("testimonialAuthor", { defaultValue: "Ahmed Tawer" })}
                  <span className="mx-1.5 text-white/30">·</span>
                  {t("testimonialRole", { defaultValue: "Product Lead" })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: legal links */}
        <div className="relative z-10 flex items-center gap-5 text-xs text-white/60">
          <Link href="#" className="transition-colors hover:text-white/90">
            {t("privacyPolicy", { defaultValue: "Privacy Policy" })}
          </Link>
          <Link href="#" className="transition-colors hover:text-white/90">
            {t("termsOfService", { defaultValue: "Terms of Service" })}
          </Link>
        </div>
      </aside>

      {/* ── Right: Form panel ────────────────────────────────────────────── */}
      <main className="relative flex min-h-screen flex-col px-5 py-8 sm:px-8 lg:py-12">
        {/* Mobile-only mini logo */}
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <BrandLogo variant="dark" size="sm" />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
