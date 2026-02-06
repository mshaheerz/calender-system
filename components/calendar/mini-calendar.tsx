'use client';

import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  eventsMap?: Map<string, number>;
  className?: string;
}

export function MiniCalendar({
  selectedDate,
  onDateSelect,
  eventsMap,
  className,
}: MiniCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(selectedDate);

  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const prevMonthDays = Array(firstDayOfWeek).fill(null).map((_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfWeek - i));
    return date;
  });

  const allDays = [...prevMonthDays, ...days];
  const remainingDays = 42 - allDays.length;
  const nextMonthDays = Array(remainingDays).fill(null).map((_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const calendarDays = [...allDays, ...nextMonthDays];

  return (
    <div className={cn('w-full bg-background rounded-lg border border-border p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}
          className="p-1 hover:bg-muted rounded"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-semibold text-sm">{format(displayMonth, 'MMMM yyyy')}</h3>
        <button
          onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
          className="p-1 hover:bg-muted rounded"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-semibold text-center text-muted-foreground h-6">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, displayMonth);
          const isSelected = isSameDay(day, selectedDate);
          const eventCount = eventsMap?.get(format(day, 'yyyy-MM-dd')) || 0;

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(day)}
              className={cn(
                'h-8 text-xs rounded flex flex-col items-center justify-center relative transition-colors',
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground opacity-50',
                isSelected
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'hover:bg-muted'
              )}
            >
              <span>{format(day, 'd')}</span>
              {eventCount > 0 && isCurrentMonth && (
                <span className="text-[10px] text-primary font-bold">{eventCount}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
