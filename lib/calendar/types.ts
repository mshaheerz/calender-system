// Event Types
export type EventType = 'task' | 'meeting' | 'appointment' | 'deadline' | 'job' | 'break' | 'maintenance' | 'resource-allocation';
export type EventStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'scheduled';
export type ViewMode = 'day' | 'week' | 'month' | 'timeline' | 'resource-schedule' | 'technician';
export type ThemeMode = 'light' | 'dark';

export interface Resource {
  id: string;
  name: string;
  type: 'technician' | 'equipment' | 'room' | 'vehicle';
  avatar?: string;
  color?: string;
  availability?: {
    startTime: string;
    endTime: string;
    days: number[];
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  startTime: Date;
  endTime: Date;
  resourceId?: string;
  resourceIds?: string[];
  allDay?: boolean;
  recurrence?: RecurrenceRule;
  color?: string;
  location?: string;
  attendees?: string[];
  priority?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[];
}

export interface CalendarContextType {
  events: CalendarEvent[];
  resources: Resource[];
  selectedDate: Date;
  viewMode: ViewMode;
  themeMode: ThemeMode;
  dragEnabled: boolean;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  selectDate: (date: Date) => void;
  setViewMode: (mode: ViewMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDragEnabled: (enabled: boolean) => void;
  getEventsByDate: (date: Date) => CalendarEvent[];
  getEventsByResource: (resourceId: string) => CalendarEvent[];
}

export interface CalendarDragData {
  eventId: string;
  resourceId?: string;
  sourceDate: Date;
  sourceTime?: string;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  events: CalendarEvent[];
}

export interface DayViewConfig {
  startHour: number;
  endHour: number;
  slotDuration: number;
  showWeekView?: boolean;
  showAllDayEvents?: boolean;
}

export interface WeekViewConfig {
  startHour: number;
  endHour: number;
  slotDuration: number;
  compressWeekends?: boolean;
}

export interface MonthViewConfig {
  dragEnabled: boolean;
  showEventCount?: boolean;
  highlightToday?: boolean;
}

export interface ResourceScheduleConfig {
  groupBy: 'resource' | 'department';
  startHour: number;
  endHour: number;
  slotDuration: number;
}
