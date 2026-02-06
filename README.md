# Gantt Timeline Component Library

A production-ready, open-source React component library for building beautiful, interactive timeline and Gantt chart interfaces with drag-and-drop support.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18+-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5+-blue.svg)

## Features

- 📅 **Multiple Views**: Day, week, and month view modes
- 🎯 **Drag & Drop**: Smooth, accessible drag interactions powered by Atlaskit
- ⚡ **High Performance**: Optimized rendering with memoization
- 🎨 **Fully Themeable**: Built with Tailwind CSS and design tokens
- ♿ **Accessible**: Keyboard navigation and ARIA labels
- 📦 **Composable**: Reusable components for complex timelines
- 🔄 **Resize Support**: Drag to adjust job start/end times
- 🚀 **TypeScript**: Full type safety with comprehensive definitions
- 🎪 **Live Playground**: Interactive demo included

## Quick Start

### 1. Installation

```bash
npm install @atlaskit/pragmatic-drag-and-drop \
  @atlaskit/pragmatic-drag-and-drop-auto-scroll \
  date-fns tiny-invariant
```

### 2. Copy Components

Copy the Gantt components to your project:

```bash
cp -r components/gantt your-project/components/
cp -r lib/gantt your-project/lib/
```

### 3. Wrap with Context

```tsx
import { GanttContext } from '@/lib/gantt/gantt-context';
import { createGanttRegistry } from '@/lib/gantt/gantt-registry';

export default function SchedulePage() {
  const [registry] = useState(createGanttRegistry);
  const [instanceId] = useState(() => Symbol('gantt'));
  const [isDragging, setIsDragging] = useState(false);

  const contextValue = useMemo(() => {
    return {
      instanceId,
      registerJobCard: registry.registerJobCard,
      registerTechnicianRow: registry.registerTechnicianRow,
      viewMode: 'day',
      isDragging,
      setIsDragging,
    };
  }, [instanceId, isDragging]);

  return (
    <GanttContext.Provider value={contextValue}>
      {/* Your content */}
    </GanttContext.Provider>
  );
}
```

### 4. Use GanttContainer

```tsx
import { GanttContainer } from '@/components/gantt';
import type { Job } from '@/lib/gantt/types';

export default function Schedule() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'job-1',
      technicianId: '1',
      title: 'Service Visit',
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: 'scheduled',
      location: 'NYC',
    },
  ]);

  return (
    <GanttContainer
      technicians={technicians}
      jobs={jobs}
      viewMode="day"
      currentDate={new Date()}
      onJobMove={({ jobId, toTechnicianId, newStartTime }) => {
        // Update job in your backend
      }}
      onJobCreate={(jobId, technicianId, startTime, endTime) => {
        // Create new job assignment
      }}
      onJobResize={(jobId, newStartTime, newEndTime) => {
        // Resize job
      }}
    />
  );
}
```

## API Reference

### GanttContainer Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `technicians` | `Technician[]` | Yes | Array of technician objects |
| `jobs` | `Job[]` | Yes | Array of job objects to display |
| `viewMode` | `'day' \| 'week' \| 'month'` | Yes | Current view mode |
| `currentDate` | `Date` | Yes | Current date for viewport |
| `onJobMove` | `(config) => void` | No | Called when job is moved |
| `onJobCreate` | `(jobId, technicianId, startTime, endTime) => void` | No | Called when job is assigned |
| `onJobResize` | `(jobId, newStartTime?, newEndTime?) => void` | No | Called when job is resized |

### Job Type

```typescript
interface Job {
  id: string;
  technicianId: string;
  title: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}
```

### Technician Type

```typescript
interface Technician {
  id: string;
  name: string;
  image?: string | null;
  email?: string;
  phone?: string;
}
```

## View Modes

### Day View
Hour-by-hour timeline for detailed scheduling. Perfect for daily planning.

```tsx
<GanttContainer viewMode="day" {...props} />
```

### Week View
Daily blocks across a week. Great for weekly planning and resource allocation.

```tsx
<GanttContainer viewMode="week" {...props} />
```

### Month View
Calendar-based layout showing entire months. Ideal for high-level planning.

```tsx
<GanttContainer viewMode="month" {...props} />
```

## Drag & Drop Features

### Moving Jobs
- Drag any job card to move it to a different technician or time slot
- Real-time preview shows drop location
- Auto-scrolling when dragging near edges

### Resizing Jobs
- Hover over a job to reveal resize handles
- Drag left edge to adjust start time
- Drag right edge to adjust end time
- Minimum duration enforced (15 minutes)

### Visual Feedback
- Cards highlight during drag
- Drop zones show enhanced styling
- Smooth animations throughout

## Components

### GanttContainer
Main container component that orchestrates the entire timeline.

### GanttTechnicianRow
Renders a single technician's timeline row with their assigned jobs.

### GanttJobCard
Individual job card with drag and resize support.

### GanttMonthCalendar
Month view with calendar-style layout.

### useGanttContext
Hook to access gantt context within components.

## Customization

### Styling
All components use Tailwind CSS and design tokens. Customize by:

1. Modifying `tailwind.config.ts`
2. Updating design tokens in `app/globals.css`
3. Overriding component classes in your implementation

### Creating Custom Variants
Extend components by creating wrappers:

```tsx
export function CustomGanttCard({ job, ...props }) {
  return (
    <GanttJobCard job={job} {...props} />
  );
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized with React `memo` and `useCallback`
- Handles 100+ jobs without lag
- Auto-scrolling with RAF
- Efficient event delegation

## Examples

Check the `/playground` route for interactive examples with different configurations.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use in your projects.

## Support

- 📚 [Documentation](/docs)
- 🎪 [Live Playground](/playground)
- 🐛 [Report Issues](https://github.com/yourusername/gantt-timeline/issues)
- 💬 [Discussions](https://github.com/yourusername/gantt-timeline/discussions)

## Credits

Built with:
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Atlaskit Pragmatic Drag and Drop](https://atlassian.design/components/pragmatic-drag-and-drop)
- [date-fns](https://date-fns.org)
