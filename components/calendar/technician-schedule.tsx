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
import { CalendarEvent, Resource } from '@/lib/calendar/types';
import { X, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechnicianScheduleProps {
  date: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
}

const EVENT_COLORS: Record<string, string> = {
  meeting: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100',
  task: 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-100',
  appointment: 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100',
  deadline: 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100',
  job: 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100',
  break: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100',
  maintenance: 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700 text-orange-900 dark:text-orange-100',
  'resource-allocation': 'bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-100',
};

export function TechnicianSchedule({
  date,
  startHour = 6,
  endHour = 22,
  slotDuration = 60,
}: TechnicianScheduleProps) {
  const { events, resources, deleteEvent, updateEvent } = useCalendarContext();
  const [expandedTechs, setExpandedTechs] = useState<Set<string>>(
    new Set((resources.filter(r => r.type === 'technician') || []).map(r => r.id))
  );
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ y: 0, eventId: '' });
  const [resizingEvent, setResizingEvent] = useState<string | null>(null);

  const hours = eachHourOfInterval({
    start: set(startOfDay(date), { hours: startHour }),
    end: set(endOfDay(date), { hours: endHour }),
  });

  const technicians = resources.filter(r => r.type === 'technician');

  const toggleTechnician = (techId: string) => {
    const newExpanded = new Set(expandedTechs);
    if (newExpanded.has(techId)) {
      newExpanded.delete(techId);
    } else {
      newExpanded.add(techId);
    }
    setExpandedTechs(newExpanded);
  };

  const getTechnicianEvents = (techId: string) => {
    return events.filter(
      e =>
        isSameDay(e.startTime, date) &&
        (e.resourceId === techId || e.resourceIds?.includes(techId))
    );
  };

  const getEventPosition = (event: CalendarEvent) => {
    const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();
    const dayStartMinutes = startHour * 60;
    const top = ((startMinutes - dayStartMinutes) / slotDuration) * 60;

    const durationMinutes =
      (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
    const height = (durationMinutes / slotDuration) * 60;

    return { top: `${Math.max(0, top)}px`, height: `${Math.max(height, 40)}px` };
  };

  const handleEventMouseDown = (e: React.MouseEvent, eventId: string) => {
    if ((e.target as HTMLElement).closest('[data-resize]')) {
      setResizingEvent(eventId);
      return;
    }
    setDraggingEvent(eventId);
    setDragStart({ y: e.clientY, eventId });
  };

  const handleEventMouseMove = (e: React.MouseEvent, eventId: string) => {
    if (!resizingEvent && resizingEvent === eventId) {
      const event = events.find(ev => ev.id === eventId);
      if (event) {
        const delta = e.clientY - dragStart.y;
        const minutesDelta = Math.round((delta / 60) * 15);
        
        updateEvent(eventId, {
          endTime: addMinutes(event.endTime, minutesDelta),
        });
      }
    }
  };

  const handleEventMouseUp = (e: React.MouseEvent, eventId: string) => {
    if (draggingEvent === eventId && dragStart.eventId === eventId) {
      const event = events.find(ev => ev.id === eventId);
      if (event) {
        const delta = e.clientY - dragStart.y;
        const minutesDelta = Math.round((delta / 60) * 15);

        updateEvent(eventId, {
          startTime: addMinutes(event.startTime, minutesDelta),
          endTime: addMinutes(event.endTime, minutesDelta),
        });
      }
    }
    setDraggingEvent(null);
    setResizingEvent(null);
  };

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Technicians List */}
      <div className="w-72 border-r border-border bg-muted/20 overflow-y-auto flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border sticky top-0 bg-background z-10">
          <h3 className="font-bold text-lg">{format(date, 'MMM d, yyyy')}</h3>
          <p className="text-xs text-muted-foreground mt-1">Technicians & Tasks</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {technicians.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No technicians available
            </div>
          ) : (
            technicians.map(tech => {
              const techEvents = getTechnicianEvents(tech.id);
              const isExpanded = expandedTechs.has(tech.id);

              return (
                <div key={tech.id} className="border-b border-border">
                  {/* Technician Header */}
                  <button
                    onClick={() => toggleTechnician(tech.id)}
                    className="w-full flex items-center gap-2 bg-muted/30 hover:bg-muted p-3 transition-colors text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tech.color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{techEvents.length} task(s)</p>
                    </div>
                  </button>

                  {/* Technician Tasks */}
                  {isExpanded && (
                    <div className="bg-background px-3 py-2 space-y-1 max-h-48 overflow-y-auto">
                      {techEvents.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-2">No tasks assigned</p>
                      ) : (
                        techEvents.map(event => (
                          <div
                            key={event.id}
                            className={cn(
                              'p-2 rounded text-xs border-l-4 cursor-move hover:shadow-sm transition-all group',
                              EVENT_COLORS[event.type] || EVENT_COLORS.meeting
                            )}
                            draggable
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
            })
          )}
        </div>
      </div>

      {/* Right Timeline */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Timeline Header with Time Display */}
        <div className="border-b border-border px-4 py-2 sticky top-0 z-20 bg-background">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Technician Timeline</p>
            <p className="text-sm font-medium">
              {format(new Date(), 'HH:mm:ss')}
            </p>
          </div>
        </div>

        {/* Hour Scale */}
        <div className="border-b border-border overflow-x-auto sticky top-10 z-10 bg-background">
          <div className="flex min-w-max">
            {hours.map((hour, idx) => (
              <div
                key={idx}
                className="min-w-20 border-r border-border text-center text-xs font-medium text-muted-foreground py-2 px-1"
              >
                {format(hour, 'HH:00')}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto">
          {technicians.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No technicians available
            </div>
          ) : (
            technicians.map(tech => {
              const techEvents = getTechnicianEvents(tech.id);
              const isExpanded = expandedTechs.has(tech.id);

              return (
                <div key={tech.id} className="border-b border-border">
                  {/* Technician Timeline Row Header */}
                  <div className="flex items-center h-12 bg-muted/20 px-4 border-b border-border sticky left-0 z-5">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: tech.color || '#3B82F6' }}
                    />
                    <span className="text-sm font-medium truncate flex-1">{tech.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{techEvents.length} tasks</span>
                  </div>

                  {/* Timeline Bar */}
                  {isExpanded && (
                    <div className="relative h-20 bg-background overflow-x-auto">
                      <div className="flex min-w-max relative h-full">
                        {/* Grid Lines */}
                        {hours.map((_, idx) => (
                          <div key={idx} className="min-w-20 border-r border-border relative h-full" />
                        ))}

                        {/* Events */}
                        {techEvents.map(event => {
                          const { top, height } = getEventPosition(event);
                          const hourOffset = event.startTime.getHours() - startHour;
                          const leftOffset = hourOffset * 80;

                          return (
                            <div
                              key={event.id}
                              className={cn(
                                'absolute top-1 p-1 rounded border-l-4 text-xs cursor-move transition-all select-none group',
                                EVENT_COLORS[event.type] || EVENT_COLORS.meeting,
                                draggingEvent === event.id && 'opacity-60 z-40 ring-2 ring-primary',
                                resizingEvent === event.id && 'opacity-50'
                              )}
                              style={{
                                left: `${leftOffset + 4}px`,
                                width: '72px',
                                height: '72px',
                              }}
                              onMouseDown={e => handleEventMouseDown(e, event.id)}
                              onMouseMove={e => handleEventMouseMove(e, event.id)}
                              onMouseUp={e => handleEventMouseUp(e, event.id)}
                            >
                              <div className="flex flex-col h-full">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate text-[11px] leading-tight">{event.title}</p>
                                  <p className="text-[9px] opacity-75">
                                    {format(event.startTime, 'HH:mm')}
                                  </p>
                                </div>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    deleteEvent(event.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-0.5 right-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Resize Handle */}
                              <div
                                data-resize
                                className="absolute bottom-0 left-0 right-0 h-1 bg-primary/50 hover:bg-primary cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                onMouseDown={e => {
                                  e.stopPropagation();
                                  handleEventMouseDown(e, event.id);
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
