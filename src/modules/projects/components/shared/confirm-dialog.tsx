import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";
import { AlertTriangle, Info, type LucideIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /**
   * Visual emphasis. `destructive` shows an amber/red icon and renders the
   * confirm action with the destructive button style. `info` is a neutral
   * confirmation (e.g. archive/restore).
   */
  tone?: "destructive" | "info";
  /** Optional override icon. */
  icon?: LucideIcon;
  /** When true, the confirm button shows a spinner and is disabled. */
  isPending?: boolean;
}

/**
 * Project-wide confirmation dialog. Built on shadcn `AlertDialog` with explicit
 * tone semantics so destructive actions stay visually consistent across the
 * project management screens.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  tone = "destructive",
  icon,
  isPending = false,
}: ConfirmDialogProps) {
  const t = useTranslations("shared.dialogs.deletion");
  const Icon = icon ?? (tone === "destructive" ? AlertTriangle : Info);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                tone === "destructive"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-foreground",
              )}
              aria-hidden="true"
            >
              <Icon className="size-5" />
            </span>
            <div className="flex flex-col gap-1.5">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isPending}>
            {cancelLabel ?? t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              tone === "destructive" &&
                buttonVariants({ variant: "destructive" }),
            )}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? <Spinner className="size-4" /> : null}
            {confirmLabel ?? t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
