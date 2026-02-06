# Comprehensive Calendar System Updates

## What's New

### 1. Technician-Based Schedule View
- **Left Sidebar**: Lists all technicians with expandable event cards showing assigned tasks with times
- **Right Timeline**: Horizontal Gantt-style visualization of technician workload across the day
- **Features**: 
  - Expandable/collapsible technician rows
  - Drag-and-drop events between time slots
  - Event resize handles for adjusting duration
  - Real-time event deletion
  - Color-coded by event type

### 2. Enhanced Drag & Drop Across All Views
- **Day View**: Full drag and drop support for moving events, double-click to create new events
- **Week View**: Fixed layout with proper dragging in each day column, no sticky positioning conflicts
- **Month View**: Toggle-able drag support for moving events between days
- **Timeline View**: Horizontal drag and drop with time-based positioning
- **Resource Schedule**: Left sidebar resources with draggable right timeline
- **Technician Schedule**: Specialized drag handling for technician workload management

### 3. Real-Time Time Display
- Header now shows current time (HH:mm:ss) updating every second
- Displayed in all views for reference
- Helps with quick time-based scheduling decisions

### 4. Improved Event Positioning
- All views use consistent pixel-to-minute conversion calculations
- Proper height and width calculations based on event duration
- No overlapping or positioning bugs
- Z-index management for proper layering during drag operations

### 5. Event Type Color Coding
All event types have unique, accessible colors in both light and dark modes:
- **Meeting**: Blue
- **Task**: Purple
- **Appointment**: Green
- **Deadline**: Red
- **Job**: Yellow
- **Break**: Gray
- **Maintenance**: Orange
- **Resource Allocation**: Indigo

### 6. Consistent Interactions Across Views
- Click to view event details
- Double-click to create new event (day view)
- Drag to move/reschedule
- Resize handles for adjusting duration
- Hover to reveal delete button
- Keyboard accessible navigation

## Technical Implementation

### Drag and Drop Mechanism
All views use a consistent pattern:
1. `onMouseDown` - Capture drag start position and event ID
2. `onMouseMove` - Calculate delta (pixels moved)
3. `onMouseUp` - Convert pixel delta to minutes, update event time

### State Management
Calendar context provides:
- Event CRUD operations
- View mode management
- Theme management
- Drag state tracking
- Resource management

### Type Safety
Full TypeScript support with proper types for:
- Events, Resources, View modes
- Calendar state and actions
- Component props
- Event handlers

## View Details

### Day View
- 6am - 10pm default (configurable)
- All-day event section at top
- Hourly time slots with visual grid
- Draggable events with delete button
- Double-click to create new event

### Week View
- 7-day horizontal grid layout
- Fixed 64px time column on left
- Flexible day columns
- All events visible at once
- Proper drag handling without sticky bugs

### Month View
- Full calendar grid
- Toggle drag & drop on/off
- Event count indicators
- Quick day navigation
- Click to switch to day view

### Timeline View
- Vertical resource list on left
- Horizontal time grid on right
- Gantt chart style visualization
- Expandable resource rows
- Time-based positioning

### Resource Schedule
- Left sidebar with resource list
- Right timeline visualization
- Expandable resource details
- Drag events between resources
- Time-based allocation

### Technician Schedule
- Left sidebar: Technician roster with task list
- Right timeline: Visual workload distribution
- Drag tasks to reschedule
- Resize handles for duration adjustment
- Resource color coding
- Expandable technician rows

## Usage Example

```jsx
import { Calendar } from '@/components/calendar';
import { CalendarProvider } from '@/lib/calendar/calendar-context';
import { ThemeProvider } from '@/lib/calendar/theme';

export function App() {
  return (
    <ThemeProvider defaultMode="dark">
      <CalendarProvider
        initialEvents={events}
        initialResources={resources}
        initialViewMode="technician"
      >
        <Calendar />
      </CalendarProvider>
    </ThemeProvider>
  );
}
```

## Performance Optimizations

- Efficient event filtering and positioning
- Memoized calculations for coordinates
- Minimal re-renders during drag
- CSS-based animations for smooth interactions
- Proper cleanup of event listeners

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Full touch support on mobile (with proper mouse event handling)
- Keyboard accessible
- Theme respects system preference

## Future Enhancements

- Touch and pen support for drag operations
- Collaborative editing with real-time sync
- Advanced filtering and search
- Custom event types
- Calendar sharing and permissions
- Integration with external calendar services
