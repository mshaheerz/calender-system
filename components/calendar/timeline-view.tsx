'use client';

import React, { useState } from 'react';
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
import { X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  date: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
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

export function TimelineView({
  date,
  startHour = 6,
  endHour = 22,
  slotDuration = 60,
}: TimelineViewProps) {
  const { events, deleteEvent, updateEvent } = useCalendarContext();
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const dayStart = set(startOfDay(date), { hours: startHour });
  const dayEnd = set(endOfDay(date), { hours: endHour });
  
  const dayEvents = events
    .filter(e => isSameDay(e.startTime, date) && !e.allDay)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const hours = eachHourOfInterval({
    start: dayStart,
    end: dayEnd,
  });

  const getEventPosition = (event: CalendarEvent) => {
    const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();
    const dayStartMinutes = startHour * 60;
    const top = ((startMinutes - dayStartMinutes) / slotDuration) * 60;

    const durationMinutes =
      (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
    const width = (durationMinutes / 15) * 10;

    return { top: `${top}px`, width: `${Math.max(width, 100)}px` };
  };

  const handleEventMouseDown = (e: React.MouseEvent, eventId: string) => {
    setDraggingEvent(eventId);
    setDragOffset(e.clientY);
  };

  const handleEventMouseUp = (e: React.MouseEvent, eventId: string) => {
    if (!draggingEvent) return;

    const delta = e.clientY - dragOffset;
    const minutesDelta = Math.round((delta / 60) * slotDuration);

    const event = events.find(ev => ev.id === eventId);
    if (event) {
      updateEvent(eventId, {
        startTime: addMinutes(event.startTime, minutesDelta),
        endTime: addMinutes(event.endTime, minutesDelta),
      });
    }

    setDraggingEvent(null);
  };

  return (
    <div className="flex h-full bg-background text-foreground">
      {/* Sidebar - Resources/Left Info */}
      <div className="w-80 border-r border-border bg-muted/20 overflow-auto flex flex-col">
        <div className="p-4 border-b border-border sticky top-0 bg-background">
          <h3 className="font-bold text-lg">{format(date, 'EEEE, MMMM d, yyyy')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* All Day Events */}
        {dayEvents.some(e => e.allDay) && (
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">ALL DAY</p>
            <div className="space-y-1">
              {dayEvents
                .filter(e => e.allDay)
                .map(event => (
                  <div
                    key={event.id}
                    className={cn(
                      'p-2 rounded text-xs font-medium border cursor-pointer hover:shadow-md transition-shadow group',
                      EVENT_COLORS[event.type] || EVENT_COLORS.meeting
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{event.title}</span>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Event List */}
        <div className="flex-1 overflow-auto px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground mb-3">TIMELINE EVENTS</p>
          <div className="space-y-2">
            {dayEvents
              .filter(e => !e.allDay)
              .map(event => (
                <div
                  key={event.id}
                  className={cn(
                    'p-2 rounded-lg text-xs border-l-4 cursor-pointer hover:shadow-md transition-all group',
                    EVENT_COLORS[event.type] || EVENT_COLORS.meeting
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{event.title}</p>
                      <div className="flex items-center gap-1 text-[10px] opacity-75 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-[10px] opacity-60 mt-1 capitalize">{event.type}</p>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Timeline Header */}
        <div className="border-b border-border px-4 py-3 sticky top-0 z-20 bg-background">
          <p className="text-sm font-semibold text-muted-foreground">Timeline Gantt View</p>
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 overflow-auto">
          {/* Hour Scale */}
          <div className="flex border-b border-border sticky top-12 z-10 bg-background">
            <div className="w-20 border-r border-border bg-muted/30 flex-shrink-0"></div>
            <div className="flex flex-1 overflow-x-auto">
              {hours.map((hour, idx) => (
                <div
                  key={idx}
                  className="min-w-24 border-r border-border text-center text-xs font-semibold text-muted-foreground py-2 bg-muted/20"
                >
                  {format(hour, 'HH:00')}
                </div>
              ))}
            </div>
          </div>

          {/* Events Timeline */}
          <div className="relative">
            {dayEvents.map(event => {
              const { top, width } = getEventPosition(event);
              return (
                <div
                  key={event.id}
                  className="relative"
                  style={{
                    height: '60px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {/* Event Row Label */}
                  <div className="absolute left-0 top-0 w-20 h-full border-r border-border bg-muted/30 flex items-center px-2 text-xs font-semibold truncate">
                    {event.title.slice(0, 10)}
                  </div>

                  {/* Event Bar */}
                  <div className="absolute left-20 top-1/2 transform -translate-y-1/2 h-10 flex">
                    <div
                      className={cn(
                        'rounded border-l-4 p-1.5 text-xs cursor-move transition-all select-none group flex items-center',
                        EVENT_COLORS[event.type] || EVENT_COLORS.meeting,
                        draggingEvent === event.id && 'opacity-60 z-40'
                      )}
                      style={{ width }}
                      onMouseDown={e => handleEventMouseDown(e, event.id)}
                      onMouseUp={e => handleEventMouseUp(e, event.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-[11px]">{event.title}</p>
                        <p className="text-[9px] opacity-75">
                          {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                        </p>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteEvent(event.id);
                        }}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
