"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReminderCreateDialog from "@/modules/reminders/components/reminder-create-dialog";
import { ReminderEntityType } from "@/modules/reminders/types";

interface SetReminderButtonProps {
  projectId: string;
  entityType: ReminderEntityType;
  entityId?: string;
  entityLabel?: string;
  defaultMessage?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  triggerLabel?: string;
}

export function SetReminderButton({
  projectId,
  entityType,
  entityId,
  entityLabel,
  defaultMessage,
  variant = "outline",
  size = "sm",
  className,
  triggerLabel = "Set reminder",
}: SetReminderButtonProps) {
  return (
    <ReminderCreateDialog
      projectId={projectId}
      triggerLabel={triggerLabel}
      triggerVariant={variant}
      triggerSize={size}
      triggerClassName={className}
      triggerIcon={<Bell className="size-4" />}
      initialEntityType={entityType}
      initialEntityId={entityId}
      initialEntityLabel={entityLabel}
      defaultMessage={defaultMessage}
      lockEntity
    />
  );
}

export default SetReminderButton;
