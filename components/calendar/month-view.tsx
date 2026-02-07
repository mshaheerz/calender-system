"use client";

import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { useCalendarContext } from "@/lib/calendar/calendar-context";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  date: Date;
  onDateSelect?: (date: Date) => void;
  dragEnabled?: boolean;
  onToggleDrag?: (enabled: boolean) => void;
}

const EVENT_COLORS: Record<string, string> = {
  meeting: "bg-blue-500",
  task: "bg-purple-500",
  appointment: "bg-green-500",
  deadline: "bg-red-500",
  job: "bg-yellow-500",
  break: "bg-gray-500",
  maintenance: "bg-orange-500",
  "resource-allocation": "bg-indigo-500",
};

export function MonthView({
  date,
  onDateSelect,
  dragEnabled = false,
  onToggleDrag,
}: MonthViewProps) {
  const { events, deleteEvent, updateEvent } = useCalendarContext();
  const [displayMonth, setDisplayMonth] = useState(date);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);

  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const prevMonthDays = Array(firstDayOfWeek)
    .fill(null)
    .map((_, i) => {
      const date = new Date(monthStart);
      date.setDate(date.getDate() - (firstDayOfWeek - i));
      return date;
    });

  const allDays = [...prevMonthDays, ...days];
  const remainingDays = 42 - allDays.length;
  const nextMonthDays = Array(remainingDays)
    .fill(null)
    .map((_, i) => {
      const date = new Date(monthEnd);
      date.setDate(date.getDate() + i + 1);
      return date;
    });

  const calendarDays = [...allDays, ...nextMonthDays];

  const getDayEvents = (day: Date) => {
    return events.filter((e) => isSameDay(new Date(e.startTime), day));
  };

  const handleEventDragStart = (e: React.DragEvent, eventId: string) => {
    if (!dragEnabled) return;
    e.stopPropagation();
    setDraggedEvent(eventId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("eventId", eventId);
  };

  const handleDayDragOver = (e: React.DragEvent) => {
    if (!dragEnabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDayDrop = (e: React.DragEvent, targetDay: Date) => {
    if (!dragEnabled) return;
    e.preventDefault();

    const eventId = e.dataTransfer.getData("eventId");
    const event = events.find((ev) => ev.id === eventId);

    if (event) {
      const timeDiff =
        new Date(event.endTime).getTime() - new Date(event.startTime).getTime();
      const newStartTime = new Date(targetDay);
      const oldStart = new Date(event.startTime);
      newStartTime.setHours(oldStart.getHours());
      newStartTime.setMinutes(oldStart.getMinutes());

      const newEndTime = new Date(newStartTime.getTime() + timeDiff);

      updateEvent(eventId, {
        startTime: newStartTime,
        endTime: newEndTime,
      });
    }

    setDraggedEvent(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold min-w-48">
            {format(displayMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={dragEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleDrag?.(!dragEnabled)}
            className="gap-2"
          >
            {dragEnabled ? "Drag ON" : "Drag OFF"}
          </Button>
          <Button size="sm" variant="outline" className="gap-2 bg-transparent">
            <Plus className="h-4 w-4" />
            Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-muted/50 border-b border-border">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-3 text-center font-semibold text-sm text-muted-foreground border-r border-border last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, displayMonth);
            const dayEvents = getDayEvents(day);

            return (
              <div
                key={idx}
                onDragOver={handleDayDragOver}
                onDrop={(e) => handleDayDrop(e, day)}
                className={cn(
                  "border-r border-b border-border p-2 min-h-24 overflow-hidden",
                  isCurrentMonth ? "bg-background" : "bg-muted/30",
                  draggedEvent && "bg-primary/5",
                )}
              >
                {/* Date Number */}
                <div className="mb-1">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded",
                      isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground",
                      isSameDay(day, new Date()) &&
                        "bg-primary text-primary-foreground font-bold",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-1 text-xs">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      draggable={dragEnabled}
                      onDragStart={(e) => handleEventDragStart(e, event.id)}
                      onClick={() => onDateSelect?.(day)}
                      className={cn(
                        "px-1 py-0.5 rounded truncate cursor-pointer text-white font-medium",
                        EVENT_COLORS[event.type] || EVENT_COLORS.meeting,
                        dragEnabled && "cursor-move",
                        draggedEvent === event.id && "opacity-50",
                      )}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
