import React, { useMemo, useCallback, useState, useRef } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Eye, SquarePen, Trash2 } from 'lucide-react';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import './calendar.css';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

const DnDCalendar = withDragAndDrop(Calendar as any);

export const CalendarView: React.FC<any> = ({
  events,
  onSelectEvent,
  onSelectSlot,
  onEventUpdate,
  onDeleteEvent,
  onViewRegistrants,
}) => {
  const [contextEvent, setContextEvent] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const contextTriggerRef = useRef<HTMLDivElement>(null);

  const calendarEvents = useMemo(() => {
    return (events || []).map((event: any) => {
      // 1. Get the dates from the database
      const dbStartDate = event.startDate || event.eventDate;
      const dbEndDate = event.endDate;

      // 2. Parse the start date (fallback to right now if missing)
      const start = dbStartDate ? new Date(dbStartDate) : new Date();

      // 3. Determine if the event "has a time"
      // Since we removed time fields from the DB, we assume it's "all-day" (no time)
      // if the time is exactly 00:00:00 (midnight).
      const hasTime = start.getHours() !== 0 || start.getMinutes() !== 0;
      const allDay = !hasTime;

      // 4. Parse the end date
      let end: Date;
      if (dbEndDate) {
        end = new Date(dbEndDate);
        // If end date is somehow before start date, fix it
        if (end < start) end = new Date(start);
      } else {
        // "events that don't have a enddate" -> endDate becomes startDate
        end = new Date(start);
      }

      // 5. Final UI adjustments for the Calendar component
      let calendarEnd = new Date(end);

      if (allDay) {
        // If it's all-day and spans multiple days, the calendar needs +1 day to render correctly
        if (calendarEnd.getTime() > start.getTime()) {
          calendarEnd.setDate(calendarEnd.getDate() + 1);
        }
      } else {
        // "if it has time but no enddate... the time should apply but the endDate should become startDate"
        // Since we don't have an explicit 'endTime', we just add 1 hour to make the block visible in the calendar.
        if (calendarEnd.getTime() === start.getTime()) {
          calendarEnd.setHours(start.getHours() + 1);
        }
      }

      return {
        ...event,
        id: event._id,
        title: event.eventName,
        start,
        end: calendarEnd,
        allDay,
      };
    });
  }, [events]);

  const handleEventUpdate = useCallback(({ event, start, end }: any) => {
    const eventId = event.id || event._id;

    // Check if the dropped slot is all-day (times are midnight)
    const isAllDay = start.getHours() === 0 && start.getMinutes() === 0 && start.getSeconds() === 0 &&
      end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0;

    const updates: any = { startDate: start };

    if (isAllDay) {
      const durationMs = end.getTime() - start.getTime();
      const days = Math.round(durationMs / (24 * 60 * 60 * 1000));

      // RBC gives exclusive end for all-day events, so convert to inclusive by subtracting 1 day
      if (days > 1) {
        const endInclusive = new Date(end);
        endInclusive.setDate(endInclusive.getDate() - 1);
        updates.endDate = endInclusive;
      } else {
        // Single day — end = start for clean zero-duration storage
        updates.endDate = start;
      }
    } else {
      updates.endDate = end;
    }

    onEventUpdate(eventId, updates);
  }, [onEventUpdate]);

  // Custom event component that intercepts right-click via ContextMenu
  const EventWrapper = useCallback(({ event, children }: any) => {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="h-full w-full">
            {children}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          {onViewRegistrants && (
            <ContextMenuItem
              onClick={() => onViewRegistrants(event.id || event._id)}
              className="gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4 text-muted-foreground" />
              View Details
            </ContextMenuItem>
          )}
          <ContextMenuItem
            onClick={() => onSelectEvent?.(event)}
            className="gap-2 cursor-pointer"
          >
            <SquarePen className="h-4 w-4 text-muted-foreground" />
            Edit Event
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => setDeleteTarget(event)}
            className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }, [onSelectEvent, onViewRegistrants]);

  return (
    <>
      <div className="h-[700px] w-full border rounded-xl p-4 bg-background shadow-sm">
        <DnDCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          onEventDrop={handleEventUpdate}
          onEventResize={handleEventUpdate}
          defaultView={Views.MONTH}
          selectable
          resizable
          showMultiDayTimes={true}
          components={{
            eventWrapper: EventWrapper,
          }}
        />
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{deleteTarget?.title || deleteTarget?.eventName}"</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDeleteEvent?.(deleteTarget?.id || deleteTarget?._id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
