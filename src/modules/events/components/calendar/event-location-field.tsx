"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { LoaderCircle, LocateFixed, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import type { EventLocationSuggestionType } from "../../types";
import type { EventFormSchema } from "../../validations/event.schema";
import {
  reverseEventLocation,
  searchEventLocations,
} from "../../services/extraction/event-locations";
import {
  buildOpenStreetMapUrl,
  formatCoordinatesLocation,
} from "../../utils/location";

const EventLocationMap = dynamic(() => import("./event-location-map"), {
  ssr: false,
});

interface EventLocationFieldProps {
  form: UseFormReturn<EventFormSchema>;
}

export function EventLocationField({ form }: EventLocationFieldProps) {
  const t = useTranslations("modules.events.upload");
  const locationValue = form.watch("location") ?? "";
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");
  const debouncedLocation = useDebounce(locationValue, 350);

  const [suggestions, setSuggestions] = useState<EventLocationSuggestionType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [isPinSyncing, setIsPinSyncing] = useState(false);
  const [isSuggestionListOpen, setIsSuggestionListOpen] = useState(false);

  useEffect(() => {
    form.register("latitude");
    form.register("longitude");
  }, [form]);

  useEffect(() => {
    let isActive = true;

    async function runSearch() {
      const query = debouncedLocation.trim();

      if (query.length < 2 || !isSuggestionListOpen) {
        if (isActive) {
          setSuggestions([]);
          setIsSearching(false);
        }
        return;
      }

      setIsSearching(true);

      try {
        const nextSuggestions = await searchEventLocations({
          query,
          limit: 5,
        });

        if (isActive) {
          setSuggestions(nextSuggestions);
        }
      } catch {
        if (isActive) {
          setSuggestions([]);
        }
      } finally {
        if (isActive) {
          setIsSearching(false);
        }
      }
    }

    runSearch();

    return () => {
      isActive = false;
    };
  }, [debouncedLocation, isSuggestionListOpen]);

  const hasCoordinates =
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude);

  const mapUrl = useMemo(() => {
    if (!hasCoordinates) {
      return "";
    }

    return buildOpenStreetMapUrl(latitude, longitude);
  }, [hasCoordinates, latitude, longitude]);

  const applySuggestion = (suggestion: EventLocationSuggestionType) => {
    form.setValue("location", suggestion.label, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue("latitude", suggestion.latitude, {
      shouldDirty: true,
    });
    form.setValue("longitude", suggestion.longitude, {
      shouldDirty: true,
    });

    setIsSuggestionListOpen(false);
    setSuggestions([]);
  };

  const syncPinLocation = async (nextLatitude: number, nextLongitude: number) => {
    setIsPinSyncing(true);

    try {
      const resolvedLocation = await reverseEventLocation({
        latitude: nextLatitude,
        longitude: nextLongitude,
      });

      form.setValue(
        "location",
        resolvedLocation?.label || formatCoordinatesLocation(nextLatitude, nextLongitude),
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        },
      );
      form.setValue("latitude", nextLatitude, { shouldDirty: true });
      form.setValue("longitude", nextLongitude, { shouldDirty: true });
    } catch {
      form.setValue("location", formatCoordinatesLocation(nextLatitude, nextLongitude), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.setValue("latitude", nextLatitude, { shouldDirty: true });
      form.setValue("longitude", nextLongitude, { shouldDirty: true });
      toast.error(t("dialog.locationHelper.errors.lookupFailed"));
    } finally {
      setIsPinSyncing(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error(t("dialog.locationHelper.errors.unsupported"));
      return;
    }

    setIsResolvingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000,
        });
      });

      const { latitude: nextLatitude, longitude: nextLongitude } = position.coords;
      const resolvedLocation = await reverseEventLocation({
        latitude: nextLatitude,
        longitude: nextLongitude,
      });

      form.setValue(
        "location",
        resolvedLocation?.label || formatCoordinatesLocation(nextLatitude, nextLongitude),
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        },
      );
      form.setValue("latitude", nextLatitude, { shouldDirty: true });
      form.setValue("longitude", nextLongitude, { shouldDirty: true });
      setIsSuggestionListOpen(false);
      toast.success(t("dialog.locationHelper.success"));
    } catch (error) {
      const geoError = error as GeolocationPositionError;

      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          toast.error(t("dialog.locationHelper.errors.permissionDenied"));
          break;
        case geoError.TIMEOUT:
          toast.error(t("dialog.locationHelper.errors.timeout"));
          break;
        case geoError.POSITION_UNAVAILABLE:
          toast.error(t("dialog.locationHelper.errors.unavailable"));
          break;
        default:
          toast.error(t("dialog.locationHelper.errors.unknown"));
      }
    } finally {
      setIsResolvingLocation(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FormLabel>{t("dialog.fields.location")}</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleUseCurrentLocation}
              disabled={isResolvingLocation}
            >
              {isResolvingLocation ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <LocateFixed className="size-4" />
              )}
              {t("dialog.locationHelper.action")}
            </Button>
          </div>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                placeholder={t("dialog.locationHelper.placeholder")}
                onFocus={() => setIsSuggestionListOpen(true)}
                onChange={(event) => {
                  field.onChange(event);
                  form.setValue("latitude", undefined, { shouldDirty: true });
                  form.setValue("longitude", undefined, { shouldDirty: true });
                  setIsSuggestionListOpen(true);
                }}
              />
              <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </FormControl>
          <p className="text-xs text-muted-foreground">
            {t("dialog.locationHelper.description")}
          </p>

          {isSuggestionListOpen && locationValue.trim().length >= 2 ? (
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-sm">
              {isSearching ? (
                <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  {t("dialog.locationHelper.states.searching")}
                </div>
              ) : suggestions.length ? (
                <div className="max-h-56 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.latitude}-${suggestion.longitude}-${suggestion.label}`}
                      type="button"
                      className="flex w-full items-start gap-3 border-b border-border/60 px-3 py-3 text-left transition hover:bg-muted/40 last:border-b-0"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-sm font-medium text-foreground">
                          {suggestion.label}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatCoordinatesLocation(
                            suggestion.latitude,
                            suggestion.longitude,
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-3 text-sm text-muted-foreground">
                  {t("dialog.locationHelper.states.noResults")}
                </div>
              )}
            </div>
          ) : null}

          {hasCoordinates ? (
            <div className="space-y-3 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.04] via-background to-transparent p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("dialog.locationHelper.mapTitle")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPinSyncing
                      ? t("dialog.locationHelper.states.syncingPin")
                      : t("dialog.locationHelper.mapDescription")}
                  </p>
                </div>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("dialog.locationHelper.openInMap")}
                </a>
              </div>

              <EventLocationMap
                latitude={latitude}
                longitude={longitude}
                label={locationValue}
                onChange={syncPinLocation}
              />

              <div className="rounded-xl border border-border/60 bg-background/90 px-3 py-2 text-xs text-muted-foreground">
                {formatCoordinatesLocation(latitude, longitude)}
              </div>
            </div>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
