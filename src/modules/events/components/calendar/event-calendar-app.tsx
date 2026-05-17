"use client";;
import { EventCalendar, CalendarEventType } from ".";
import useEvents from "../../hooks/extraction/use-events";
import { EventType } from "../../types";
import useEventsActions from "../../hooks/event-actions";
import EventWrapper from "./event-wrapper";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";

interface Props {
  type: EventType;
}

export default function EventCalendarApp({ type }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [calendarDisplayedDays, setCalendarDisplayedDays] = useState<{ from?: Date; to?: Date }>(
    {}
  );
  const selectedEventId = searchParams.get("eventId");
  const selectedDate = searchParams.get("date");
  const initialDate = selectedDate ? new Date(selectedDate) : undefined;

  const { user, isLoading: userIsLoading } = useCurrentUser();
  const { events, eventsAreLoading } = useEvents({
    type,
    from: calendarDisplayedDays.from,
    to: calendarDisplayedDays.to
  });
  const { handleEventDelete, isPending, handleEventUpdate } = useEventsActions({
    type
  });
  const userHasViewPermissions = type === "personalEvent" ? true : user ? hasPermissions(user.roles, type === "event" ? "eventsManagement" : "meetingsManagement", "view") : false;

  const clearSelectedEvent = () => {
    if (!selectedEventId && !selectedDate) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("eventId");
    params.delete("date");
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  };

  return (
    events && (
      <EventWrapper type={type}>
        <EventCalendar
          events={userHasViewPermissions ? events as CalendarEventType[] : []}
          isLoading={eventsAreLoading || userIsLoading}
          onEventDelete={handleEventDelete}
          onEventUpdate={handleEventUpdate}
          setDisplayedDateRanges={setCalendarDisplayedDays}
          initialDate={initialDate}
          selectedEventId={selectedEventId}
          onSelectedEventClose={clearSelectedEvent}
        />
      </EventWrapper>
    )
  );
}
