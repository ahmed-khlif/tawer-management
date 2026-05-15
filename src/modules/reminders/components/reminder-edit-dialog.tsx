"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { fetchReminderDetail } from "@/modules/reminders/services/reminders";
import useReminderUpload from "@/modules/reminders/hooks/use-reminder-upload";
import { RecurrencePicker } from "./recurrence-picker";

interface ReminderEditDialogProps {
  projectId: string;
  reminderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReminderEditDialog({
  projectId,
  reminderId,
  open,
  onOpenChange,
}: ReminderEditDialogProps) {
  const { data: detail } = useQuery({
    queryKey: ["project-reminder", projectId, reminderId],
    queryFn: () => fetchReminderDetail(projectId, reminderId!),
    enabled: open && !!reminderId,
  });
  const { updateReminder } = useReminderUpload(projectId);
  const [message, setMessage] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState("");

  useEffect(() => {
    if (!detail) return;
    setMessage(detail.message ?? "");
    setReminderAt(new Date(detail.reminderAt).toISOString().slice(0, 16));
    setRecurring(detail.isRecurring ?? false);
    setRecurrenceRule(detail.recurrenceRule ?? "");
  }, [detail]);

  if (!reminderId) return null;

  const handleSave = async () => {
    await updateReminder.mutateAsync({
      reminderId,
      data: {
        message: message || undefined,
        reminderAt: reminderAt ? new Date(reminderAt) : undefined,
        isRecurring: recurring,
        recurrenceRule: recurring ? recurrenceRule || undefined : undefined,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit reminder</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Reminder time</Label>
            <Input
              type="datetime-local"
              value={reminderAt}
              onChange={(event) => setReminderAt(event.target.value)}
            />
          </div>


          <div className="space-y-3 rounded-xl border bg-muted/30 p-4 transition-all hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold cursor-pointer" htmlFor="edit-recurring">Recurring reminder</Label>
                <p className="text-[11px] text-muted-foreground">Send this reminder on a schedule</p>
              </div>
              <Switch id="edit-recurring" checked={recurring} onCheckedChange={setRecurring} />
            </div>
            {recurring ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <RecurrencePicker 
                  value={recurrenceRule} 
                  onChange={setRecurrenceRule} 
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateReminder.isPending}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReminderEditDialog;
