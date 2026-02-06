'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { CalendarEvent, Resource, CalendarContextType, ViewMode, ThemeMode } from './types';
import invariant from 'tiny-invariant';

const CalendarContext = createContext<CalendarContextType | null>(null);

interface CalendarState {
  events: CalendarEvent[];
  resources: Resource[];
  selectedDate: Date;
  viewMode: ViewMode;
  themeMode: ThemeMode;
  dragEnabled: boolean;
}

type CalendarAction =
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: { id: string; event: Partial<CalendarEvent> } }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SELECT_DATE'; payload: Date }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_THEME_MODE'; payload: ThemeMode }
  | { type: 'SET_DRAG_ENABLED'; payload: boolean }
  | { type: 'SET_EVENTS'; payload: CalendarEvent[] }
  | { type: 'SET_RESOURCES'; payload: Resource[] };

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(e =>
          e.id === action.payload.id ? { ...e, ...action.payload.event } : e
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(e => e.id !== action.payload),
      };
    case 'SELECT_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_THEME_MODE':
      return { ...state, themeMode: action.payload };
    case 'SET_DRAG_ENABLED':
      return { ...state, dragEnabled: action.payload };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'SET_RESOURCES':
      return { ...state, resources: action.payload };
    default:
      return state;
  }
}

export function CalendarProvider({
  children,
  initialEvents = [],
  initialResources = [],
  initialViewMode = 'month',
  initialThemeMode = 'dark',
}: {
  children: React.ReactNode;
  initialEvents?: CalendarEvent[];
  initialResources?: Resource[];
  initialViewMode?: ViewMode;
  initialThemeMode?: ThemeMode;
}) {
  const [state, dispatch] = useReducer(calendarReducer, {
    events: initialEvents,
    resources: initialResources,
    selectedDate: new Date(),
    viewMode: initialViewMode,
    themeMode: initialThemeMode,
    dragEnabled: true,
  });

  const addEvent = useCallback((event: CalendarEvent) => {
    dispatch({ type: 'ADD_EVENT', payload: event });
  }, []);

  const updateEvent = useCallback((id: string, event: Partial<CalendarEvent>) => {
    dispatch({ type: 'UPDATE_EVENT', payload: { id, event } });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: id });
  }, []);

  const selectDate = useCallback((date: Date) => {
    dispatch({ type: 'SELECT_DATE', payload: date });
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    dispatch({ type: 'SET_THEME_MODE', payload: mode });
  }, []);

  const setDragEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_DRAG_ENABLED', payload: enabled });
  }, []);

  const getEventsByDate = useCallback(
    (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return state.events.filter(e => {
        const eventDateStr = e.startTime.toISOString().split('T')[0];
        return eventDateStr === dateStr;
      });
    },
    [state.events]
  );

  const getEventsByResource = useCallback(
    (resourceId: string) => {
      return state.events.filter(
        e => e.resourceId === resourceId || e.resourceIds?.includes(resourceId)
      );
    },
    [state.events]
  );

  const value: CalendarContextType = {
    events: state.events,
    resources: state.resources,
    selectedDate: state.selectedDate,
    viewMode: state.viewMode,
    themeMode: state.themeMode,
    dragEnabled: state.dragEnabled,
    addEvent,
    updateEvent,
    deleteEvent,
    selectDate,
    setViewMode,
    setThemeMode,
    setDragEnabled,
    getEventsByDate,
    getEventsByResource,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  const value = useContext(CalendarContext);
  invariant(value, 'useCalendarContext must be used within CalendarProvider');
  return value;
}
