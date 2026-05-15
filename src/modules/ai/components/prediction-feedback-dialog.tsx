"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePredictionOutcomeFeedback } from "@/modules/ai/hooks/use-ai";

interface PredictionFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  estimatedHours?: number | null;
  taskTitle?: string;
  onSubmitted?: () => void;
}

export function PredictionFeedbackDialog({
  open,
  onOpenChange,
  taskId,
  estimatedHours,
  taskTitle,
  onSubmitted,
}: PredictionFeedbackDialogProps) {
  const [actualHours, setActualHours] = useState<string>("");
  const feedback = usePredictionOutcomeFeedback();

  useEffect(() => {
    if (!open) {
      setActualHours("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!taskId) return;
    const value = Number(actualHours);
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Enter a valid number of hours.");
      return;
    }
    try {
      await feedback.mutateAsync({ taskId, actualHours: value });
      toast.success("Thanks! Your feedback was recorded.");
      onOpenChange(false);
      onSubmitted?.();
    } catch {
      toast.error("Unable to submit feedback.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How long did this task actually take?</DialogTitle>
          <DialogDescription>
            {taskTitle ? `For task: ${taskTitle}.` : null} Help the AI improve estimates by
            sharing the real number of hours spent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {typeof estimatedHours === "number" ? (
            <p className="text-sm text-muted-foreground">
              Estimated: <span className="font-medium">{estimatedHours}h</span>
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="actual-hours">Actual hours</Label>
            <Input
              id="actual-hours"
              type="number"
              min={0}
              step="0.25"
              value={actualHours}
              onChange={(event) => setActualHours(event.target.value)}
              placeholder="e.g. 6.5"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={feedback.isPending || !actualHours}
          >
            Submit feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PredictionFeedbackDialog;
