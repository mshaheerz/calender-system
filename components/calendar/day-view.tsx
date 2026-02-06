'use client';

import React, { useCallback, useState } from 'react';
import {
  format,
  startOfDay,
  endOfDay,
  eachHourOfInterval,
  isSameDay,
  set,
  addMinutes,
} from 'date-fns';
import { useCalendarContext } from '@/lib/calendar/calendar-context';
import { CalendarEvent } from '@/lib/calendar/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayViewProps {
  date: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
  onCreateEvent?: (startTime: Date, endTime: Date) => void;
}

const EVENT_COLORS: Record<string, string> = {
  meeting: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700',
  task: 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700',
  appointment: 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700',
  deadline: 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700',
  job: 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700',
  break: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700',
  maintenance: 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700',
  'resource-allocation': 'bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700',
};

export function DayView({
  date,
  startHour = 6,
  endHour = 22,
  slotDuration = 60,
  onCreateEvent,
}: DayViewProps) {
  const { events, deleteEvent, updateEvent } = useCalendarContext();
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);

  const dayEvents = events.filter(e => isSameDay(e.startTime, date));
  const hours = eachHourOfInterval({
    start: set(date, { hours: startHour, minutes: 0, seconds: 0 }),
    end: set(date, { hours: endHour, minutes: 0, seconds: 0 }),
  });

  const getEventPosition = (event: CalendarEvent) => {
    const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();
    const dayStartMinutes = startHour * 60;
    const top = ((startMinutes - dayStartMinutes) / slotDuration) * 60;

    const durationMinutes =
      (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
    const height = (durationMinutes / slotDuration) * 60;

    return { top: `${top}px`, height: `${height}px` };
  };

  const handleTimeSlotClick = (hour: number) => {
    const clickedTime = set(date, { hours: hour, minutes: 0, seconds: 0 });
    setSelectionStart(clickedTime);
  };

  const handleTimeSlotDoubleClick = (hour: number) => {
    const startTime = set(date, { hours: hour, minutes: 0, seconds: 0 });
    const endTime = addMinutes(startTime, 60);

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: 'New Event',
      type: 'meeting',
      status: 'scheduled',
      startTime,
      endTime,
    };

    onCreateEvent?.(startTime, endTime);
  };

  const handleEventDragStart = (e: React.MouseEvent, eventId: string) => {
    setDraggingEvent(eventId);
    setDragOffset(e.clientY);
  };

  const handleEventDragEnd = (e: React.MouseEvent, eventId: string) => {
    if (!draggingEvent) return;

    const delta = e.clientY - dragOffset;
    const minutesDelta = Math.round((delta / 60) * slotDuration);

    const event = events.find(ev => ev.id === eventId);
    if (event) {
      const newStartTime = addMinutes(event.startTime, minutesDelta);
      const newEndTime = addMinutes(event.endTime, minutesDelta);
      updateEvent(eventId, {
        startTime: newStartTime,
        endTime: newEndTime,
      });
    }

    setDraggingEvent(null);
  };

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
        <h2 className="text-2xl font-bold">{format(date, 'EEEE, MMMM d, yyyy')}</h2>
        <p className="text-sm text-muted-foreground">
          {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} today
        </p>
      </div>

      {/* All Day Events */}
      {dayEvents.some(e => e.allDay) && (
        <div className="bg-muted/50 border-b border-border px-4 py-2">
          <p className="text-xs font-semibold text-muted-foreground mb-2">ALL DAY</p>
          <div className="space-y-1">
            {dayEvents
              .filter(e => e.allDay)
              .map(event => (
                <div
                  key={event.id}
                  className={cn(
                    'p-2 rounded text-xs font-medium border cursor-pointer hover:shadow-md transition-shadow',
                    EVENT_COLORS[event.type] || EVENT_COLORS.meeting
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{event.title}</span>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="ml-2 opacity-60 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Time Slots */}
      <div className="relative">
        {hours.map((hour, idx) => {
          const hourStr = format(hour, 'HH:00');

          return (
            <div
              key={idx}
              className="flex border-b border-border min-h-[60px] relative group cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleTimeSlotClick(hour.getHours())}
              onDoubleClick={() => handleTimeSlotDoubleClick(hour.getHours())}
            >
              {/* Time Label */}
              <div className="w-16 bg-muted/30 flex items-start justify-center pt-1 text-xs text-muted-foreground font-medium sticky left-0 z-10">
                {hourStr}
              </div>

              {/* Time Slot Content */}
              <div className="flex-1 relative px-2">
                {/* Time slot events */}
                {dayEvents
                  .filter(
                    e =>
                      !e.allDay &&
                      e.startTime.getHours() === hour.getHours()
                  )
                  .map(event => {
                    const { top, height } = getEventPosition(event);
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'absolute left-2 right-2 p-1.5 rounded border-l-4 text-xs cursor-move transition-all',
                          EVENT_COLORS[event.type] || EVENT_COLORS.meeting,
                          draggingEvent === event.id && 'opacity-50 z-40'
                        )}
                        style={{ top, height: `${Math.max(height, 30)}px`, minHeight: '30px' }}
                        draggable
                        onDragStart={e => handleEventDragStart(e, event.id)}
                        onDragEnd={e => handleEventDragEnd(e, event.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{event.title}</p>
                            <p className="text-[10px] opacity-75 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                            </p>
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                            className="ml-1 opacity-60 hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
