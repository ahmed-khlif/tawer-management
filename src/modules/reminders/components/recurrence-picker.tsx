"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronDown, Calendar, Clock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatRRule, RRULE_PRESETS } from "../utils/rrule-parser";

interface RecurrencePickerProps {
  value?: string;
  onChange: (value: string) => void;
}

const DAYS = [
  { label: "M", value: "MO", full: "Monday" },
  { label: "T", value: "TU", full: "Tuesday" },
  { label: "W", value: "WE", full: "Wednesday" },
  { label: "T", value: "TH", full: "Thursday" },
  { label: "F", value: "FR", full: "Friday" },
  { label: "S", value: "SA", full: "Saturday" },
  { label: "S", value: "SU", full: "Sunday" },
];

export function RecurrencePicker({ value = "", onChange }: RecurrencePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  
  // Custom states
  const [freq, setFreq] = useState("DAILY");
  const [interval, setInterval] = useState(1);
  const [byDay, setByDay] = useState<string[]>([]);

  useEffect(() => {
    if (!value) return;
    
    // Check if value matches any preset
    const preset = RRULE_PRESETS.find(p => p.value === value);
    if (!preset && value) {
      setIsCustom(true);
      // Parse current value to set custom states
      const parts = value.split(";").reduce((acc, part) => {
        const [k, v] = part.split("=");
        if (k && v) acc[k.toUpperCase()] = v.toUpperCase();
        return acc;
      }, {} as Record<string, string>);
      
      if (parts["FREQ"]) setFreq(parts["FREQ"]);
      if (parts["INTERVAL"]) setInterval(parseInt(parts["INTERVAL"], 10));
      if (parts["BYDAY"]) setByDay(parts["BYDAY"].split(","));
    }
  }, [value]);

  const generateRRule = (f: string, i: number, days: string[]) => {
    let rule = `FREQ=${f};INTERVAL=${i}`;
    if (f === "WEEKLY" && days.length > 0) {
      rule += `;BYDAY=${days.join(",")}`;
    }
    return rule;
  };

  const handleDayToggle = (day: string) => {
    const next = byDay.includes(day)
      ? byDay.filter(d => d !== day)
      : [...byDay, day];
    setByDay(next);
    onChange(generateRRule(freq, interval, next));
  };

  const handleFreqChange = (f: string) => {
    setFreq(f);
    onChange(generateRRule(f, interval, byDay));
  };

  const handleIntervalChange = (i: number) => {
    const val = Math.max(1, i);
    setInterval(val);
    onChange(generateRRule(freq, val, byDay));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between font-normal h-10 border-dashed hover:border-primary/50"
        >
          <div className="flex items-center gap-2 truncate">
            <RotateCcw className="size-3.5 text-muted-foreground" />
            {value ? (
              <span className="truncate font-medium">{formatRRule(value)}</span>
            ) : (
              <span className="text-muted-foreground">Set recurrence schedule</span>
            )}
          </div>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-3 border-b bg-muted/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Recurrence</p>
        </div>
        
        <div className="p-1">
          {RRULE_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant="ghost"
              className={cn(
                "w-full justify-between font-normal h-9 px-3",
                value === preset.value && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
              onClick={() => {
                onChange(preset.value);
                setIsCustom(false);
                setIsOpen(false);
              }}
            >
              <span className="text-sm">{preset.label}</span>
              {value === preset.value && <Check className="size-3.5" />}
            </Button>
          ))}
          
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between font-normal h-9 px-3",
              isCustom && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            onClick={() => setIsCustom(true)}
          >
            <span className="text-sm">Custom schedule...</span>
            {isCustom && <Check className="size-3.5" />}
          </Button>
        </div>

        {isCustom && (
          <div className="p-4 border-t space-y-4 bg-muted/5 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Frequency</label>
              <Select value={freq} onValueChange={handleFreqChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Every</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={interval}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                  className="h-8 w-16 text-xs"
                />
                <span className="text-xs text-muted-foreground">
                  {freq === "DAILY" && "days"}
                  {freq === "WEEKLY" && "weeks"}
                  {freq === "MONTHLY" && "months"}
                  {freq === "YEARLY" && "years"}
                </span>
              </div>
            </div>

            {freq === "WEEKLY" && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">On Days</label>
                <div className="flex justify-between">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full text-[10px] font-bold border transition-colors",
                        byDay.includes(day.value)
                          ? "bg-primary border-primary text-primary-foreground shadow-sm"
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <Badge variant="outline" className="w-full justify-center py-1 bg-background font-normal text-[11px] text-muted-foreground">
                {formatRRule(generateRRule(freq, interval, byDay))}
              </Badge>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
