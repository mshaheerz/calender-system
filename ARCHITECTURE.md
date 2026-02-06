# Gantt Timeline Architecture

This document describes the architecture and design patterns used in the Gantt Timeline component library.

## Table of Contents

1. [Overview](#overview)
2. [Component Hierarchy](#component-hierarchy)
3. [State Management](#state-management)
4. [Drag & Drop System](#drag--drop-system)
5. [Type System](#type-system)
6. [Performance Optimizations](#performance-optimizations)
7. [Contributing](#contributing)

## Overview

The Gantt Timeline library is built with React and TypeScript, focusing on:

- **Composability**: Small, reusable components that work together
- **Performance**: Optimized rendering with memoization
- **Accessibility**: WCAG compliant keyboard navigation
- **Type Safety**: Comprehensive TypeScript definitions
- **Flexibility**: Works with any data source (REST, GraphQL, etc.)

## Component Hierarchy

```
<GanttContext.Provider>
  <GanttContainer>
    ├── Time Header
    ├── GanttTechnicianRow (multiple)
    │   ├── Technician Info
    │   ├── Time Slot Cells (multiple)
    │   └── GanttJobCard (multiple)
    │       ├── Card Content
    │       ├── Left Resize Handle
    │       └── Right Resize Handle
    └── GanttMonthCalendar (month view)
        ├── Technician Sidebar
        └── Calendar Grid
            └── CalendarCell (multiple)
                └── DraggableJobItem
```

### Component Descriptions

#### GanttContext
Provides shared state for the entire timeline system:
- `instanceId`: Unique identifier for drag-drop monitoring
- `registerJobCard`: Register draggable job cards
- `registerTechnicianRow`: Register drop targets
- `viewMode`: Current view (day/week/month)
- `isDragging`: Global drag state

#### GanttContainer
Main orchestrator component that:
- Manages timeline state (jobs, technicians)
- Sets up drag-drop monitoring
- Handles job moves and resizes
- Calculates time positions based on drag
- Manages auto-scrolling

#### GanttTechnicianRow
Renders a technician's timeline row with:
- Technician information panel
- Time slot grid cells
- Positioned job cards
- Dynamic row height based on overlapping jobs

#### GanttJobCard
Individual job representation with:
- Draggable main card
- Left/right resize handles
- Status-based styling
- Time display
- Location information

#### GanttMonthCalendar
Month view implementation with:
- Technician sidebar selection
- Calendar grid layout
- Job preview in cells
- "More jobs" popover

## State Management

### Parent-Managed State

The library uses a **parent-controlled** state pattern:

```tsx
// Parent component manages jobs
const [jobs, setJobs] = useState<Job[]>([]);

// Pass data to GanttContainer
<GanttContainer
  jobs={jobs}
  onJobMove={(config) => {
    // Handle update in parent
    setJobs(...)
  }}
/>
```

**Advantages**:
- Single source of truth
- Works with any backend (REST, GraphQL, etc.)
- Easy to add side effects (API calls, logging)
- Supports undo/redo patterns

### Context for Drag-Drop Coordination

The GanttContext is used only for drag-drop coordination:

```tsx
// Registry tracks component instances
const registry = createGanttRegistry();
const instanceId = Symbol('gantt-instance');

// Context provides drag-drop infrastructure
<GanttContext.Provider value={{
  instanceId,
  registerJobCard,
  registerTechnicianRow,
  viewMode,
  isDragging,
  setIsDragging,
}}>
```

## Drag & Drop System

### Architecture

Built on **Atlaskit Pragmatic Drag and Drop**, which provides:

1. **Flexible API**: Works with any visual library
2. **Entry-Level Warnings**: Helpful console messages
3. **No Implicit Side Effects**: Explicit event monitoring
4. **No DOM Mutations During Drag**: Performant

### Flow

```
1. User starts drag on GanttJobCard
   ├─ getInitialData() captures job info
   └─ setDragging(true)

2. monitorForElements() tracks movement
   ├─ Calculate position based on drop target
   ├─ Update dragOverData state
   └─ Show preview in correct lane

3. Drop on valid target
   ├─ Calculate final time position
   ├─ Update job in parent state
   └─ setDragging(false)
```

### Time Calculation

The `calculatePreciseTime` function determines exact drop position:

```tsx
// For each view mode:
// - Day: Calculates minutes within hour
// - Week: Calculates minutes within day
// - Month: Calculates minutes within week

// Formula:
// percentage = (clientX - rect.left) / rect.width
// finalTime = baseTime + (percentage * timeSlotDuration)
```

### Auto-Scrolling

Uses `@atlaskit/pragmatic-drag-and-drop-auto-scroll`:

```tsx
autoScrollForElements({
  element: timelineScrollRef.current,
  canScroll: ({ source }) => 
    source.data.instanceId === instanceId,
})
```

Automatically scrolls container when dragging near edges.

## Type System

### Core Types

```typescript
// Job represents a scheduled work item
interface Job {
  id: string;
  technicianId: string;
  title: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  status: JobStatus;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

// Technician represents a person in the schedule
interface Technician {
  id: string;
  name: string;
  image?: string | null;
  email?: string;
  phone?: string;
}

// ViewMode controls timeline granularity
type ViewMode = 'day' | 'week' | 'month';

// JobStatus tracks job lifecycle
type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
```

### Benefits

- **IDE Autocomplete**: Full intellisense support
- **Compile-Time Errors**: Catch bugs before runtime
- **Self-Documenting**: Types serve as documentation
- **Refactoring Safety**: TypeScript catches breaking changes

## Performance Optimizations

### 1. Component Memoization

```tsx
export const GanttJobCard = memo(({ job, technicianId }) => {
  // Only re-render if props change
});

export const GanttTechnicianRow = memo(({ technician, jobs }) => {
  // Prevents unnecessary renders of entire rows
});
```

### 2. useCallback for Event Handlers

```tsx
const handleJobMove = useCallback(
  ({ jobId, toTechnicianId, newStartTime }) => {
    // Reference equality preserved across renders
  },
  [onJobMove]
);
```

### 3. useMemo for Expensive Calculations

```tsx
const positionedJobs = useMemo(() => {
  // Layout calculations only run when deps change
  return jobs.map(job => ({
    ...job,
    position: getJobPosition(job)
  }));
}, [jobs, getJobPosition]);
```

### 4. Virtual Scrolling (Future)

For large datasets (1000+ jobs), implement:
- React-window or react-virtualized
- Only render visible rows
- Smooth scrolling with efficient updates

### 5. Time Slot Grid

Minimalist grid cells instead of full elements:
- No click handlers on every cell
- Event delegation for drag-drop
- Lightweight DOM structure

## File Organization

```
components/gantt/
├── index.ts                    # Public exports
├── gantt-container.tsx         # Main orchestrator
├── gantt-technician-row.tsx    # Technician timeline row
├── gantt-job-card.tsx          # Individual job card
└── gantt-month-calendar.tsx    # Month view

lib/gantt/
├── gantt-context.tsx           # Context and hook
├── gantt-registry.ts           # Component registry
└── types.ts                    # TypeScript definitions

app/
├── page.tsx                    # Landing page
├── docs/page.tsx               # Documentation
├── playground/page.tsx         # Interactive demo
└── examples/
    └── basic-gantt.tsx         # Example implementation
```

## Design Patterns

### Provider Pattern

Context and hooks for sharing drag-drop state:

```tsx
<GanttContext.Provider value={contextValue}>
  <GanttContainer {...props} />
</GanttContext.Provider>

// Within component:
const { setIsDragging } = useGanttContext();
```

### Render Props (Future Enhancement)

For advanced customization:

```tsx
<GanttContainer
  technicians={technicians}
  jobs={jobs}
  renderJobCard={({ job, ...props }) => (
    <CustomJobCard job={job} {...props} />
  )}
/>
```

### Composition over Configuration

Small, focused components instead of monolithic one:

```tsx
// Good: Composable
<GanttContainer>
  <CustomJobCard />
  <CustomRow />
</GanttContainer>

// Avoid: Too many props
<Gantt 
  jobCardTemplate={template}
  rowTemplate={template}
  ... 50 more props
/>
```

## Testing Strategy

### Unit Tests

Test individual components:
```tsx
describe('GanttJobCard', () => {
  it('renders job title', () => {
    // Test
  });

  it('handles drag start', () => {
    // Test
  });
});
```

### Integration Tests

Test component interactions:
```tsx
describe('GanttContainer', () => {
  it('moves job when dragged', () => {
    // Test drag -> position update
  });
});
```

### E2E Tests

Test full user workflows:
```tsx
describe('Gantt Timeline', () => {
  it('allows user to schedule job', () => {
    // Navigate, drag, verify
  });
});
```

## Contributing Guidelines

### Adding New Components

1. Create component in `components/gantt/`
2. Add TypeScript interfaces
3. Document props and behavior
4. Add tests
5. Update `components/gantt/index.ts`

### Modifying Existing Components

1. Maintain backward compatibility
2. Add deprecation warnings if breaking
3. Update tests
4. Document changes in CHANGELOG.md

### Performance

- Use `memo` for components that receive object props
- Measure impact with React DevTools Profiler
- Avoid inline object/function creation in render

## References

- [Atlaskit Pragmatic Drag and Drop](https://atlassian.design/components/pragmatic-drag-and-drop)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
