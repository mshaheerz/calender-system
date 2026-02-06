'use client';

import React, { useState, useEffect } from 'react';
import { DayView } from './day-view';
import { WeekView } from './week-view';
import { MonthView } from './month-view';
import { ResourceSchedule } from './resource-schedule';
import { TechnicianSchedule } from './technician-schedule';
import { TimelineView } from './timeline-view';
import { MiniCalendar } from './mini-calendar';
import { useCalendarContext } from '@/lib/calendar/calendar-context';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Calendar() {
  const { selectedDate, selectDate, viewMode, setViewMode, dragEnabled, setDragEnabled } =
    useCalendarContext();
  const [showMiniCalendar, setShowMiniCalendar] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const views = ['day', 'week', 'month', 'timeline', 'resource-schedule', 'technician'] as const;

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar with Mini Calendar */}
      {showMiniCalendar && (
        <div className="w-80 border-r border-border bg-muted/20 overflow-auto">
          <div className="p-4 border-b border-border sticky top-0 bg-background">
            <h2 className="font-bold text-lg mb-2">Calendar</h2>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1">
                {views.map(view => (
                  <Button
                    key={view}
                    variant={viewMode === view ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode(view as any)}
                    className="text-xs capitalize"
                  >
                    {view === 'resource-schedule' ? 'Resource' : view === 'technician' ? 'Tech' : view}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4">
            <MiniCalendar
              selectedDate={selectedDate}
              onDateSelect={selectDate}
            />
          </div>

          {/* Sidebar info */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground font-semibold mb-2">TODAY</p>
            <p className="text-sm font-semibold">{format(new Date(), 'EEEE, MMMM d')}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowMiniCalendar(!showMiniCalendar)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            ☰
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold">
              {viewMode === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              {viewMode === 'week' && format(selectedDate, 'MMMM yyyy')}
              {viewMode === 'month' && format(selectedDate, 'MMMM yyyy')}
              {viewMode === 'timeline' && 'Timeline View'}
              {viewMode === 'resource-schedule' && 'Resource Schedule'}
              {viewMode === 'technician' && 'Technician Schedule'}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {format(currentTime, 'HH:mm:ss')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectDate(new Date())}
            >
              Today
            </Button>
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'day' && (
            <DayView
              date={selectedDate}
              startHour={6}
              endHour={22}
            />
          )}

          {viewMode === 'week' && (
            <WeekView
              date={selectedDate}
              startHour={6}
              endHour={22}
            />
          )}

          {viewMode === 'month' && (
            <MonthView
              date={selectedDate}
              onDateSelect={selectDate}
              dragEnabled={dragEnabled}
              onToggleDrag={setDragEnabled}
            />
          )}

          {viewMode === 'resource-schedule' && (
            <ResourceSchedule
              date={selectedDate}
              startHour={6}
              endHour={22}
            />
          )}

          {viewMode === 'timeline' && (
            <TimelineView
              date={selectedDate}
              startHour={6}
              endHour={22}
            />
          )}

          {viewMode === 'technician' && (
            <TechnicianSchedule
              date={selectedDate}
              startHour={6}
              endHour={22}
            />
          )}
        </div>
      </div>
    </div>
  );
}
