"use client";
import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { UsersRound, UserPlus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TeamUploadForm from "./form";
import { TeamType } from "@/modules/users/types/teams";

interface Props {
  team?: TeamType;
  onClose?: () => void;
  triggerOpenning?: boolean;
  triggerButtonIsUsed?: boolean;
}

export default function UploadTeamDialog({
  team,
  onClose,
  triggerOpenning = false,
  triggerButtonIsUsed = true
}: Props) {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations(
    team ? "modules.users.teams.upload.updateTeam" : "modules.users.teams.upload.createTeam"
  );

  //dialog should be openned when a new team is passed
  useEffect(() => {
    if (triggerOpenning) setOpen(true);
  }, [triggerOpenning]);

  const closePopUp = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (open) setOpen(true);
        else closePopUp();
      }}>
      <DialogTrigger asChild>
        {triggerButtonIsUsed && (
          <Button>
            <UserPlus />
            <span className="hidden sm:inline">{t("button")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl border-border/70 bg-card/98">
        <ScrollArea className="max-h-[80vh] pr-3 rtl:pr-0 rtl:pl-3">
          <DialogHeader className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.07] via-background to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10">
                <UsersRound className="size-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle>{t("title")}</DialogTitle>
                <DialogDescription>{t("description")}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="pt-5">
            <TeamUploadForm onFinish={closePopUp} team={team} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
