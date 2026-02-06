'use client';

import React, { useCallback, useState } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachHourOfInterval,
  set,
  isSameDay,
  addMinutes,
} from 'date-fns';
import { useCalendarContext } from '@/lib/calendar/calendar-context';
import { CalendarEvent } from '@/lib/calendar/types';
import { ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  date: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
  showResources?: boolean;
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

export function WeekView({
  date,
  startHour = 6,
  endHour = 22,
  slotDuration = 60,
  showResources = false,
}: WeekViewProps) {
  const { events, resources, deleteEvent, updateEvent } = useCalendarContext();
  const [displayWeekStart] = useState(startOfWeek(date));
  const weekEnd = endOfWeek(displayWeekStart);
  const days = eachDayOfInterval({ start: displayWeekStart, end: weekEnd });
  const hours = eachHourOfInterval({
    start: set(displayWeekStart, { hours: startHour, minutes: 0, seconds: 0 }),
    end: set(displayWeekStart, { hours: endHour, minutes: 0, seconds: 0 }),
  });

  const getDayEvents = (day: Date) => {
    return events.filter(e => isSameDay(e.startTime, day));
  };

  const getEventPosition = (event: CalendarEvent) => {
    const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();
    const dayStartMinutes = startHour * 60;
    const top = ((startMinutes - dayStartMinutes) / slotDuration) * 60;

    const durationMinutes =
      (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
    const height = (durationMinutes / slotDuration) * 60;

    return { top: `${top}px`, height: `${Math.max(height, 40)}px` };
  };

  const handleEventDragEnd = (eventId: string, delta: number) => {
    const event = events.find(ev => ev.id === eventId);
    if (event) {
      const minutesDelta = Math.round((delta / 60) * slotDuration);
      updateEvent(eventId, {
        startTime: addMinutes(event.startTime, minutesDelta),
        endTime: addMinutes(event.endTime, minutesDelta),
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with navigation */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold">
            {format(displayWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </span>
          <Button variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto">
        {/* Day Headers */}
        <div className="grid gap-0" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
          <div className="bg-muted/50 border-b border-border p-2"></div>
          {days.map(day => (
            <div
              key={day.toISOString()}
              className="bg-muted/50 border-b border-r border-border p-2 text-center"
            >
              <p className="text-xs font-semibold text-muted-foreground">
                {format(day, 'EEE')}
              </p>
              <p className={cn('text-lg font-bold', isSameDay(day, new Date()) && 'text-primary')}>
                {format(day, 'd')}
              </p>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {hours.map((hour, hourIdx) => (
          <div
            key={hourIdx}
            className="grid gap-0 border-b border-border min-h-20"
            style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}
          >
            {/* Hour Label */}
            <div className="bg-muted/30 border-r border-border p-2 text-xs text-muted-foreground font-semibold flex items-start pt-1">
              {format(hour, 'HH:00')}
            </div>

            {/* Day Columns */}
            {days.map(day => {
              const dayEvents = getDayEvents(day).filter(
                e => !e.allDay && e.startTime.getHours() === hour.getHours()
              );

              return (
                <div
                  key={`${day.toISOString()}-${hourIdx}`}
                  className="border-r border-border p-1 relative hover:bg-muted/30 transition-colors"
                >
                  {dayEvents.map(event => {
                    const { top, height } = getEventPosition(event);
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'absolute left-1 right-1 p-1 rounded border-l-4 text-[10px] cursor-move transition-all',
                          EVENT_COLORS[event.type] || EVENT_COLORS.meeting
                        )}
                        style={{ top, height }}
                      >
                        <p className="font-semibold truncate">{event.title}</p>
                        <p className="opacity-75">
                          {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
