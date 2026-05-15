"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface StepperProps {
  steps: StepperStep[];
  /** Zero-based index of the active step. */
  current: number;
  /** Optional click handler to jump to a step (only allowed up to highest reached). */
  onStepClick?: (index: number) => void;
  /** Highest index the user has reached so far (controls click-jumping). */
  highest?: number;
  className?: string;
  /** Layout. `horizontal` shows numbered circles inline; `vertical` stacks them. */
  orientation?: "horizontal" | "vertical";
}

type StepState = "completed" | "active" | "upcoming";

function stateOf(index: number, current: number, reach: number): StepState {
  if (index < current) return "completed";
  if (index === current) return "active";
  if (index < reach) return "completed";
  return "upcoming";
}

/**
 * A small, accessible stepper with numbered indicator circles connected by a
 * progress line. Supports completed / active / upcoming states and optional
 * click-to-jump on already-visited steps.
 */
export function Stepper({
  steps,
  current,
  onStepClick,
  highest,
  className,
  orientation = "horizontal",
}: StepperProps) {
  const reach = Math.max(highest ?? current, current);

  if (orientation === "vertical") {
    return (
      <ol className={cn("flex flex-col gap-4", className)} aria-label="Progress">
        {steps.map((step, index) => {
          const state = stateOf(index, current, reach);
          return (
            <VerticalStepRow
              key={step.id}
              step={step}
              index={index}
              state={state}
              onClick={
                onStepClick && index <= reach
                  ? () => onStepClick(index)
                  : undefined
              }
            />
          );
        })}
      </ol>
    );
  }

  return (
    <ol
      className={cn("flex w-full items-start", className)}
      aria-label="Progress"
    >
      {steps.map((step, index) => {
        const state = stateOf(index, current, reach);
        const isLast = index === steps.length - 1;
        return (
          <React.Fragment key={step.id}>
            <li
              className="flex min-w-0 flex-col items-center gap-2"
              aria-current={state === "active" ? "step" : undefined}
            >
              <Indicator
                step={step}
                index={index}
                state={state}
                onClick={
                  onStepClick && index <= reach
                    ? () => onStepClick(index)
                    : undefined
                }
              />
              <div className="flex max-w-[7rem] flex-col items-center text-center sm:max-w-[8rem]">
                <span
                  className={cn(
                    "text-xs font-medium leading-tight transition-colors",
                    state === "active"
                      ? "text-foreground"
                      : state === "completed"
                        ? "text-foreground/80"
                        : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
                {step.description ? (
                  <span className="mt-0.5 hidden text-[10px] leading-tight text-muted-foreground sm:inline">
                    {step.description}
                  </span>
                ) : null}
              </div>
            </li>

            {!isLast ? (
              <div
                aria-hidden="true"
                className={cn(
                  "mx-1 mt-4 h-[2px] flex-1 rounded-full transition-colors sm:mx-2",
                  state === "completed" ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </ol>
  );
}

function Indicator({
  step,
  index,
  state,
  onClick,
}: {
  step: StepperStep;
  index: number;
  state: StepState;
  onClick?: () => void;
}) {
  const Icon = step.icon;
  const inner =
    state === "completed" ? (
      <Check className="size-4" />
    ) : Icon ? (
      <Icon className="size-4" />
    ) : (
      <span className="text-xs font-semibold">{index + 1}</span>
    );

  const className = cn(
    "relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
    state === "completed" &&
      "border-primary bg-primary text-primary-foreground",
    state === "active" &&
      "border-primary bg-primary/10 text-primary ring-4 ring-primary/15",
    state === "upcoming" &&
      "border-border bg-background text-muted-foreground",
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(className, "cursor-pointer")}
        aria-label={`Go to step ${index + 1}: ${step.title}`}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      className={className}
      aria-label={`Step ${index + 1}: ${step.title}`}
    >
      {inner}
    </div>
  );
}

function VerticalStepRow({
  step,
  index,
  state,
  onClick,
}: {
  step: StepperStep;
  index: number;
  state: StepState;
  onClick?: () => void;
}) {
  return (
    <li className="flex items-start gap-3">
      <Indicator step={step} index={index} state={state} onClick={onClick} />
      <div className="flex min-w-0 flex-col">
        <span
          className={cn(
            "text-sm font-medium",
            state === "upcoming" && "text-muted-foreground",
          )}
        >
          {step.title}
        </span>
        {step.description ? (
          <span className="text-xs text-muted-foreground">
            {step.description}
          </span>
        ) : null}
      </div>
    </li>
  );
}
