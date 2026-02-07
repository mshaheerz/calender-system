import { CalendarEvent, Resource } from './types';
import { addHours, addDays, addMinutes, startOfDay, subDays } from 'date-fns';

const now = new Date();
const today = startOfDay(now);

export const mockResources: Resource[] = [
  {
    id: 'tech-1',
    name: 'John Smith',
    type: 'technician',
    color: '#3B82F6', // Blue
    availability: {
      startTime: '08:00',
      endTime: '17:00',
      days: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'tech-2',
    name: 'Sarah Johnson',
    type: 'technician',
    color: '#8B5CF6', // Purple
    availability: {
      startTime: '09:00',
      endTime: '18:00',
      days: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'tech-3',
    name: 'Mike Chen',
    type: 'technician',
    color: '#EC4899', // Pink
    availability: {
      startTime: '07:00',
      endTime: '16:00',
      days: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'room-1',
    name: 'Conference Room A',
    type: 'room',
    color: '#F59E0B', // Amber
  },
  {
    id: 'room-2',
    name: 'Conference Room B',
    type: 'room',
    color: '#10B981', // Emerald
  },
  {
    id: 'eq-1',
    name: 'High-Speed Scanner',
    type: 'equipment',
    color: '#06B6D4', // Cyan
  },
  {
    id: 'eq-2',
    name: 'Heavy Duty Drill',
    type: 'equipment',
    color: '#F43F5E', // Rose
  }
];

// Helper to create events relative to today
const createEvent = (
  id: string,
  title: string,
  daysFromToday: number,
  hour: number,
  minute: number,
  durationMinutes: number,
  type: CalendarEvent['type'],
  resourceId?: string,
  resourceIds?: string[],
  allDay: boolean = false
): CalendarEvent => {
  const startTime = addMinutes(addHours(addDays(today, daysFromToday), hour), minute);
  const endTime = addMinutes(startTime, durationMinutes);
  return {
    id,
    title,
    type,
    status: 'scheduled',
    startTime,
    endTime,
    resourceId,
    resourceIds,
    allDay,
    priority: Math.random() > 0.5 ? 'high' : 'medium',
  };
};

export const mockEvents: CalendarEvent[] = [
  // Past events (yesterday)
  createEvent('p1', 'Site Audit', -1, 9, 0, 120, 'job', 'tech-1'),
  createEvent('p2', 'Team Debrief', -1, 14, 0, 60, 'meeting', 'tech-2'),

  // Today
  createEvent('t1', 'Morning Standup', 0, 8, 30, 30, 'meeting', undefined, ['tech-1', 'tech-2', 'tech-3']),
  createEvent('t2', 'Client Architecture Call', 0, 10, 0, 90, 'meeting', 'tech-1'),
  createEvent('t3', 'Server Migration', 0, 13, 0, 180, 'maintenance', 'tech-2'),
  createEvent('t4', 'Quick Sync', 0, 11, 30, 30, 'meeting', 'tech-3'),
  createEvent('t5', 'Equipment Prep', 0, 16, 0, 60, 'task', 'tech-3'),
  {
    id: 't6',
    title: 'Public Holiday',
    type: 'break',
    status: 'scheduled',
    startTime: today,
    endTime: today,
    allDay: true,
  },

  // Tomorrow
  createEvent('tom1', 'Requirement Gathering', 1, 9, 30, 120, 'appointment', 'tech-2'),
  createEvent('tom2', 'Database Patching', 1, 13, 0, 60, 'maintenance', 'tech-3'),
  createEvent('tom3', 'User Testing', 1, 15, 0, 120, 'job', 'tech-1'),

  // Later this week
  createEvent('w1', 'Design Review', 2, 11, 0, 60, 'meeting', 'tech-1'),
  createEvent('w2', 'Security Audit', 2, 14, 0, 120, 'task', 'tech-2'),
  createEvent('w3', 'Weekly Wrap-up', 4, 16, 0, 60, 'meeting', undefined, ['tech-1', 'tech-2', 'tech-3']),

  // Multi-day & All day
  {
    id: 'm1',
    title: 'Offsite Workshop',
    type: 'meeting',
    status: 'scheduled',
    startTime: addDays(today, 3),
    endTime: addDays(today, 4),
    allDay: true,
  },
  {
    id: 'm2',
    title: 'Tech Conference',
    type: 'resource-allocation',
    status: 'scheduled',
    startTime: addDays(today, 7),
    endTime: addDays(today, 9),
    allDay: true,
    resourceId: 'tech-2',
  },

  // Resource allocations
  createEvent('r1', 'Room A Booked', 0, 9, 0, 480, 'resource-allocation', 'room-1'),
  createEvent('r2', 'Scanner Reserved', 1, 10, 0, 240, 'resource-allocation', 'eq-1'),
  createEvent('r3', 'Drill in Use', 0, 14, 0, 120, 'resource-allocation', 'eq-2'),
];


export const mockEventsByType = {
  meetings: mockEvents.filter(e => e.type === 'meeting'),
  tasks: mockEvents.filter(e => e.type === 'task'),
  appointments: mockEvents.filter(e => e.type === 'appointment'),
  deadlines: mockEvents.filter(e => e.type === 'deadline'),
  jobs: mockEvents.filter(e => e.type === 'job'),
  breaks: mockEvents.filter(e => e.type === 'break'),
  maintenance: mockEvents.filter(e => e.type === 'maintenance'),
  resourceAllocations: mockEvents.filter(e => e.type === 'resource-allocation'),
};

export const mockEventsByStatus = {
  pending: mockEvents.filter(e => e.status === 'pending'),
  scheduled: mockEvents.filter(e => e.status === 'scheduled'),
  inProgress: mockEvents.filter(e => e.status === 'in-progress'),
  completed: mockEvents.filter(e => e.status === 'completed'),
  cancelled: mockEvents.filter(e => e.status === 'cancelled'),
};
