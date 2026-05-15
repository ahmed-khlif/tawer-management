import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { RiCalendarLine } from "@remixicon/react";
import { Calendar } from "./ui/calendar";

interface Props {
  inputName: string;
  dateLabel: string;
  timeLabel: string;
  minDate?: Date;
  maxDate?: Date;
  /** When true, empty values stay empty (no implicit “today”). Use for optional epic/milestone/task dates. */
  allowEmpty?: boolean;
  /** Shown on the date trigger when `allowEmpty` and the field has no value */
  emptyPlaceholder?: string;
}

export default function TimeInput({
  inputName,
  dateLabel,
  timeLabel,
  minDate,
  maxDate,
  allowEmpty = false,
  emptyPlaceholder = "Pick a date",
}: Props) {
  const form = useFormContext();

  const StartHour = 0;
  const EndHour = 24;

  // EDITED: added null guard — updateDateTime can receive undefined when form field not yet initialized
  const updateDateTime = (
    currentValue: string,
    timeString: string
  ) => {
    if (!currentValue) return;
    const date = parseISO(currentValue);
    const [hours, minutes] = timeString.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    form.setValue(inputName, date.toISOString(), { shouldValidate: true });
  };

  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = StartHour; hour <= EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const val = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        options.push({ value: val, label: format(new Date(2000, 0, 1, hour, minute), "h:mm a") });
      }
    }
    return options;
  }, []);



  return (
    <FormField
      control={form.control}
      name={inputName}
      render={({ field }) => {
        const raw = field.value as string | undefined;
        const hasValue = Boolean(raw && String(raw).trim() !== "");
        const fallbackIso = new Date().toISOString();
        const effectiveIso = hasValue ? raw! : allowEmpty ? undefined : fallbackIso;
        const selectedDate = effectiveIso !== undefined ? parseISO(effectiveIso) : undefined;

        return (
          <FormItem>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <FormLabel>{dateLabel}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between font-normal">
                        <span
                          className={
                            !hasValue && allowEmpty ? "text-muted-foreground" : undefined
                          }>
                          {hasValue && selectedDate
                            ? format(selectedDate, "PPP")
                            : allowEmpty
                              ? emptyPlaceholder
                              : format(parseISO(fallbackIso), "PPP")}
                        </span>
                        <RiCalendarLine size={16} className="shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (!date) {
                          if (allowEmpty) field.onChange("");
                          return;
                        }
                        field.onChange(date.toISOString());
                      }}
                      disabled={[
                        ...(minDate ? [{ before: minDate }] : []),
                        ...(maxDate ? [{ after: maxDate }] : []),
                      ]}
                      startMonth={minDate}
                      endMonth={maxDate}
                    />
                    {allowEmpty && hasValue ? (
                      <div className="border-t p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground"
                          onClick={() => field.onChange("")}>
                          Clear date
                        </Button>
                      </div>
                    ) : null}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="w-full space-y-2 sm:w-[140px]">
                <FormLabel>{timeLabel}</FormLabel>
                <Select
                  disabled={allowEmpty && !hasValue}
                  onValueChange={(v) => updateDateTime(form.getValues(inputName) as string, v)}
                  value={
                    hasValue && raw
                      ? format(parseISO(raw), "HH:mm")
                      : undefined
                  }>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}