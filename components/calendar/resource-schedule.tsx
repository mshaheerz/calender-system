'use client';

import React, { useState } from 'react';
import {
  format,
  eachHourOfInterval,
  set,
  isSameDay,
  addMinutes,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { useCalendarContext } from '@/lib/calendar/calendar-context';
import { CalendarEvent } from '@/lib/calendar/types';
import { X, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceScheduleProps {
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

export function ResourceSchedule({
  date,
  startHour = 6,
  endHour = 22,
  slotDuration = 60,
}: ResourceScheduleProps) {
  const { events, resources, deleteEvent, updateEvent } = useCalendarContext();
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set(resources.map(r => r.id))
  );
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const hours = eachHourOfInterval({
    start: set(startOfDay(date), { hours: startHour }),
    end: set(endOfDay(date), { hours: endHour }),
  });

  const toggleResource = (resourceId: string) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resourceId)) {
      newExpanded.delete(resourceId);
    } else {
      newExpanded.add(resourceId);
    }
    setExpandedResources(newExpanded);
  };

  const getResourceEvents = (resourceId: string) => {
    return events.filter(
      e =>
        isSameDay(e.startTime, date) &&
        (e.resourceId === resourceId || e.resourceIds?.includes(resourceId))
    );
  };

  const getEventPosition = (event: CalendarEvent) => {
    const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();
    const dayStartMinutes = startHour * 60;
    const top = ((startMinutes - dayStartMinutes) / slotDuration) * 60;

    const durationMinutes =
      (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
    const width = (durationMinutes / 15) * 20;

    return { top: `${top}px`, width: `${Math.max(width, 80)}px` };
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
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Resources List */}
      <div className="w-64 border-r border-border bg-muted/20 overflow-y-auto flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border sticky top-0 bg-background">
          <h3 className="font-bold text-lg">{format(date, 'MMM d')}</h3>
          <p className="text-xs text-muted-foreground mt-1">Resources</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {resources.map(resource => {
            const resourceEvents = getResourceEvents(resource.id);
            const isExpanded = expandedResources.has(resource.id);

            return (
              <div key={resource.id} className="border-b border-border">
                {/* Resource Header */}
                <button
                  onClick={() => toggleResource(resource.id)}
                  className="w-full flex items-center gap-2 bg-muted/30 hover:bg-muted p-3 transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: resource.color || '#9CA3AF' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{resource.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                  </div>
                </button>

                {/* Resource Events List */}
                {isExpanded && (
                  <div className="bg-background px-3 py-2 space-y-1">
                    {resourceEvents.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No events</p>
                    ) : (
                      resourceEvents.map(event => (
                        <div
                          key={event.id}
                          className={cn(
                            'p-2 rounded text-xs border-l-4 cursor-pointer hover:shadow-sm transition-all group',
                            EVENT_COLORS[event.type] || EVENT_COLORS.meeting
                          )}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{event.title}</p>
                              <p className="text-[10px] opacity-75">
                                {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Timeline */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Timeline Header */}
        <div className="border-b border-border px-4 py-2 sticky top-0 z-20 bg-background">
          <p className="text-xs font-semibold text-muted-foreground">Resource Timeline</p>
        </div>

        {/* Hour Scale */}
        <div className="border-b border-border overflow-x-auto sticky top-10 z-10 bg-background">
          <div className="flex min-w-max">
            {hours.map((hour, idx) => (
              <div
                key={idx}
                className="min-w-24 border-r border-border text-center text-xs font-medium text-muted-foreground py-2 px-1"
              >
                {format(hour, 'HH:00')}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto">
          {resources.map(resource => {
            const resourceEvents = getResourceEvents(resource.id);
            const isExpanded = expandedResources.has(resource.id);

            return (
              <div key={resource.id} className="border-b border-border">
                {/* Resource Timeline Row Header */}
                <div className="flex items-center h-12 bg-muted/20 px-4 border-b border-border">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: resource.color || '#9CA3AF' }}
                  />
                  <span className="text-sm font-medium truncate">{resource.name}</span>
                </div>

                {/* Timeline Bar */}
                {isExpanded && (
                  <div className="relative h-16 bg-background overflow-x-auto">
                    <div className="flex min-w-max relative h-full">
                      {hours.map((_, idx) => (
                        <div
                          key={idx}
                          className="min-w-24 border-r border-border relative h-full"
                        />
                      ))}

                      {/* Events */}
                      {resourceEvents.map(event => {
                        const { top, width } = getEventPosition(event);
                        const hourOffset = event.startTime.getHours() - startHour;
                        const leftOffset = hourOffset * 96;

                        return (
                          <div
                            key={event.id}
                            className={cn(
                              'absolute top-1 p-1 rounded border-l-4 text-xs cursor-move transition-all select-none group',
                              EVENT_COLORS[event.type] || EVENT_COLORS.meeting,
                              draggingEvent === event.id && 'opacity-60 z-40'
                            )}
                            style={{
                              left: `${leftOffset + 4}px`,
                              width,
                              height: '56px',
                            }}
                            onMouseDown={e => handleEventMouseDown(e, event.id)}
                            onMouseUp={e => handleEventMouseUp(e, event.id)}
                          >
                            <div className="flex items-start justify-between h-full">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate text-[11px]">{event.title}</p>
                                <p className="text-[9px] opacity-75">
                                  {format(event.startTime, 'HH:mm')}
                                </p>
                              </div>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  deleteEvent(event.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
