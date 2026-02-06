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
import { X, Clock, MapPin } from 'lucide-react';
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
  const { events, resources, deleteEvent } = useCalendarContext();
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set(resources.map(r => r.id))
  );

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
    const height = (durationMinutes / slotDuration) * 60;

    return { top: `${top}px`, height: `${Math.max(height, 40)}px` };
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-2xl font-bold">{format(date, 'EEEE, MMMM d, yyyy')}</h2>
        <p className="text-sm text-muted-foreground">Resource Schedule</p>
      </div>

      {/* Resources Timeline */}
      <div className="flex-1 overflow-auto">
        {resources.map(resource => {
          const resourceEvents = getResourceEvents(resource.id);
          const isExpanded = expandedResources.has(resource.id);

          return (
            <div key={resource.id} className="border-b border-border">
              {/* Resource Header */}
              <div
                onClick={() => toggleResource(resource.id)}
                className="flex items-center gap-3 bg-muted/50 hover:bg-muted p-3 cursor-pointer transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: resource.color || '#9CA3AF' }}
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{resource.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                </div>
                <span className="text-xs font-medium bg-background px-2 py-1 rounded">
                  {resourceEvents.length} event{resourceEvents.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Resource Timeline */}
              {isExpanded && (
                <div className="relative">
                  {/* Hour Grid */}
                  <div className="grid gap-0" style={{ gridTemplateColumns: `60px repeat(${hours.length}, 80px)` }}>
                    {/* Left label */}
                    <div className="sticky left-0 z-10 bg-muted/30 border-r border-border"></div>

                    {/* Hour headers */}
                    {hours.map((hour, idx) => (
                      <div
                        key={idx}
                        className="bg-muted/30 border-r border-border text-center text-xs text-muted-foreground font-medium p-1 border-b border-border"
                      >
                        {format(hour, 'HH:00')}
                      </div>
                    ))}
                  </div>

                  {/* Time slots with events */}
                  <div className="relative min-h-24">
                    {/* Background grid */}
                    <div className="grid gap-0 absolute inset-0" style={{ gridTemplateColumns: `60px repeat(${hours.length}, 80px)` }}>
                      <div></div>
                      {hours.map((_, idx) => (
                        <div key={idx} className="border-r border-border border-b border-border" />
                      ))}
                    </div>

                    {/* Events */}
                    <div className="relative" style={{ height: `${(endHour - startHour) * 60}px` }}>
                      {resourceEvents.map(event => {
                        const { top, height } = getEventPosition(event);
                        const hourIndex = event.startTime.getHours() - startHour;

                        return (
                          <div
                            key={event.id}
                            className={cn(
                              'absolute left-[60px] p-1.5 rounded border-l-4 text-xs cursor-pointer hover:shadow-md transition-all group',
                              EVENT_COLORS[event.type] || EVENT_COLORS.meeting
                            )}
                            style={{
                              top,
                              height,
                              left: `${60 + hourIndex * 80}px`,
                              width: '76px',
                            }}
                          >
                            <div className="text-xs font-semibold truncate">{event.title}</div>
                            <div className="text-[10px] opacity-75 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {format(event.startTime, 'HH:mm')}
                            </div>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteEvent(event.id);
                              }}
                              className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
