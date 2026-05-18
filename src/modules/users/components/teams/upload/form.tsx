"use client";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorBanner } from "@/components/error-banner";
import { Label } from "@/components/ui/label";
import { TeamType } from "../../../types/teams";
import useTeamUpload from "../../../hooks/team-upload";
import useUsers from "../../../hooks/extraction/use-users";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect } from "react";

interface Props {
  onFinish: () => void;
  team?: TeamType;
}

export default function TeamUploadForm({ onFinish, team = undefined }: Props) {
  const t = useTranslations("modules.users.teams");

  const { form, isPending, onSubmit, error } = useTeamUpload({
    team,
    onSuccess: () => {
      form.reset();
      onFinish();
    }
  });

  const { users, usersAreLoading } = useUsers({});
  const selectedMemberIds = form.watch("members") ?? [];
  const selectedManagerId = form.watch("manager");
  const selectedManager = users?.find((candidate) => candidate.id === selectedManagerId);

  useEffect(() => {
    if (team)
      form.reset({
        name: team.name,
        manager: team.members.find((member) => member.isManager)?.id,
        members: team.members.filter((member) => !member.isManager).map((member) => member.id)
      });
  }, [team]);

  if (usersAreLoading) return <Loading />;
  if (!users) return <Error500 />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
          <div className="mb-4 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Team profile</h3>
            <p className="text-xs text-muted-foreground">
              Define the team identity before assigning leadership and active members.
            </p>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("upload.form.labels.name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("upload.form.placeholders.name")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.04] via-background to-transparent p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Leadership and roster</h3>
              <p className="text-xs text-muted-foreground">
                Set the manager and choose the members who will operate as one working team.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-primary/15 bg-background/80 px-2.5 py-1">
                {selectedManager ? `Manager: ${selectedManager.name}` : "No manager selected"}
              </span>
              <span className="rounded-full border border-primary/15 bg-background/80 px-2.5 py-1">
                {selectedMemberIds.length} member{selectedMemberIds.length === 1 ? "" : "s"} selected
              </span>
            </div>
          </div>

          <FormField
            name="manager"
            control={form.control}
            render={({ field }) => (
              <FormItem className="mb-4">
                <Label>{t("upload.form.labels.managers")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="mt-2 w-full justify-between bg-background/90">
                      <span className="flex items-center gap-2">
                        <PlusCircle className="size-4" />
                        {selectedManager ? selectedManager.name : t("upload.form.labels.managers")}
                      </span>
                      <span className="text-xs text-muted-foreground">Choose one</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0">
                    <Command>
                      <CommandInput
                        placeholder={t("upload.form.placeholders.managers")}
                        className="h-9"
                      />

                      <CommandList>
                        <CommandEmpty>{t("upload.form.noResults.managers")}</CommandEmpty>

                        <CommandGroup>
                          <FormControl>
                            <CommandGroup>
                              <RadioGroup value={field.value} onValueChange={field.onChange}>
                                {users &&
                                  users.map((user) => (
                                    <CommandItem key={user.id} value={user.id}>
                                      <div className="flex items-center space-x-3 py-1">
                                        <RadioGroupItem value={user.id} id={user.id} />

                                        <label
                                          htmlFor={user.id}
                                          className="flex cursor-pointer items-center gap-3">
                                          <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.image} alt={user.name} />
                                            <AvatarFallback>
                                              {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>{user.name}</div>
                                        </label>
                                      </div>
                                    </CommandItem>
                                  ))}
                              </RadioGroup>
                            </CommandGroup>
                          </FormControl>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="members"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <Label>{t("upload.form.labels.members")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="mt-2 w-full justify-between bg-background/90">
                      <span className="flex items-center gap-2">
                        <PlusCircle className="size-4" />
                        {selectedMemberIds.length > 0
                          ? `${selectedMemberIds.length} member${selectedMemberIds.length === 1 ? "" : "s"} selected`
                          : t("upload.form.labels.members")}
                      </span>
                      <span className="text-xs text-muted-foreground">Manage roster</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0">
                    <Command>
                      <CommandInput
                        placeholder={t("upload.form.placeholders.members")}
                        className="h-9"
                      />

                      <CommandList>
                        <CommandEmpty>{t("upload.form.noResults.members")}</CommandEmpty>

                        <CommandGroup>
                          <FormControl>
                            <CommandGroup>
                              {users?.map((user) => (
                                <CommandItem key={user.id} id={user.id}>
                                  <div className="flex items-center space-x-3 py-1">
                                    <Checkbox
                                      id={user.id}
                                      checked={field.value?.includes(user.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...(field.value ?? []), user.id]);
                                        } else {
                                          field.onChange(
                                            field.value?.filter((value) => value !== user.id)
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={user.id}
                                      className="flex cursor-pointer items-center gap-3">
                                      <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.image} alt={user.name} />
                                        <AvatarFallback>
                                          {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>{user.name}</div>
                                    </label>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </FormControl>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error !== "" && <ErrorBanner error={error} />}

        <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
          <Button type="button" variant="outline" onClick={onFinish} disabled={isPending}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("actions.creating")
              : team
                ? t("actions.updateTeam")
                : t("actions.createTeam")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
