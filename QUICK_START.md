# Quick Start Guide

Get up and running with Gantt Timeline in 5 minutes.

## Installation

```bash
# 1. Install dependencies
npm install @atlaskit/pragmatic-drag-and-drop \
  @atlaskit/pragmatic-drag-and-drop-auto-scroll \
  date-fns tiny-invariant

# 2. Copy components
cp -r components/gantt your-project/components/
cp -r lib/gantt your-project/lib/
```

## Basic Implementation

```tsx
'use client';

import { useState, useMemo } from 'react';
import { GanttContext } from '@/lib/gantt/gantt-context';
import { createGanttRegistry } from '@/lib/gantt/gantt-registry';
import { GanttContainer } from '@/components/gantt';
import type { Job, Technician } from '@/lib/gantt/types';

const TECHNICIANS: Technician[] = [
  { id: '1', name: 'Alice Johnson' },
  { id: '2', name: 'Bob Smith' },
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    technicianId: '1',
    title: 'Client Meeting',
    startTime: new Date(2024, 0, 15, 10, 0),
    endTime: new Date(2024, 0, 15, 12, 0),
    status: 'scheduled',
    location: 'NYC',
  },
];

export default function SchedulePage() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [registry] = useState(createGanttRegistry);
  const [instanceId] = useState(() => Symbol('gantt'));
  const [isDragging, setIsDragging] = useState(false);

  const contextValue = useMemo(() => ({
    instanceId,
    registerJobCard: registry.registerJobCard,
    registerTechnicianRow: registry.registerTechnicianRow,
    viewMode: 'day',
    isDragging,
    setIsDragging,
  }), [instanceId, isDragging]);

  return (
    <GanttContext.Provider value={contextValue}>
      <GanttContainer
        technicians={TECHNICIANS}
        jobs={jobs}
        viewMode="day"
        currentDate={new Date()}
        onJobMove={({ jobId, toTechnicianId, newStartTime }) => {
          setJobs(jobs.map(job => 
            job.id === jobId 
              ? {
                  ...job,
                  technicianId: toTechnicianId,
                  startTime: newStartTime,
                  endTime: new Date(
                    newStartTime.getTime() + 
                    (job.endTime.getTime() - job.startTime.getTime())
                  ),
                }
              : job
          ));
        }}
      />
    </GanttContext.Provider>
  );
}
```

## View Modes

Switch between different timeline perspectives:

```tsx
// Day view - hourly granularity
<GanttContainer viewMode="day" {...props} />

// Week view - daily granularity
<GanttContainer viewMode="week" {...props} />

// Month view - calendar layout
<GanttContainer viewMode="month" {...props} />
```

## Handling Updates

### Job Movement

```tsx
onJobMove={({ jobId, toTechnicianId, newStartTime }) => {
  // Update in your backend
  updateJob(jobId, { 
    technicianId: toTechnicianId,
    startTime: newStartTime 
  });
}}
```

### Job Creation (Assignment)

```tsx
onJobCreate={(jobId, technicianId, startTime, endTime) => {
  // Create new assignment
  assignJobToTechnician(jobId, {
    technicianId,
    startTime,
    endTime,
  });
}}
```

### Job Resizing

```tsx
onJobResize={(jobId, newStartTime, newEndTime) => {
  // Update job duration
  updateJobTime(jobId, { startTime: newStartTime, endTime: newEndTime });
}}
```

## Styling & Customization

### Tailwind Classes

All components use Tailwind CSS. Customize by:

1. **Modify Tailwind Config**
   ```js
   // tailwind.config.ts
   module.exports = {
     theme: {
       extend: {
         colors: {
           brand: '#1e40af', // Your brand color
         },
       },
     },
   };
   ```

2. **Override Design Tokens**
   ```css
   /* app/globals.css */
   :root {
     --brand-50: #eff6ff;
     --brand-600: #2563eb;
   }
   ```

3. **Custom Components**
   ```tsx
   export function CustomJobCard({ job, ...props }) {
     return (
       <GanttJobCard job={job} {...props} />
     );
   }
   ```

## Common Tasks

### Adding Jobs Dynamically

```tsx
const handleAddJob = (newJob: Job) => {
  setJobs([...jobs, newJob]);
};
```

### Filtering by Technician

```tsx
const filteredJobs = jobs.filter(
  job => job.technicianId === selectedTechnicianId
);
```

### Filtering by Status

```tsx
const scheduledJobs = jobs.filter(
  job => job.status === 'scheduled'
);
```

### Date Navigation

```tsx
import { addDays, subDays } from 'date-fns';

const [currentDate, setCurrentDate] = useState(new Date());

const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));
const handlePreviousDay = () => setCurrentDate(subDays(currentDate, 1));
const handleToday = () => setCurrentDate(new Date());
```

## Data Structure

### Job

```typescript
interface Job {
  id: string;                    // Unique identifier
  technicianId: string;         // Assigned technician
  title: string;                // Job title
  location?: string;            // Job location
  startTime: Date;              // Start time
  endTime: Date;                // End time
  status: JobStatus;            // 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  description?: string;         // Optional description
  priority?: Priority;          // 'low' | 'medium' | 'high'
}
```

### Technician

```typescript
interface Technician {
  id: string;          // Unique identifier
  name: string;        // Full name
  image?: string;      // Avatar URL
  email?: string;      // Email address
  phone?: string;      // Phone number
}
```

## Testing in Playground

The `/playground` route provides a fully interactive demo:

1. **Switch View Modes**: Use the dropdown to change day/week/month
2. **Navigate Dates**: Use Previous/Today/Next buttons
3. **Drag Jobs**: Drag cards to move between technicians and time slots
4. **Resize Jobs**: Hover over jobs to reveal resize handles
5. **See Stats**: View real-time job counts and status breakdown

## Deployment

### Vercel (One-Click)

1. Push to GitHub
2. Connect repository to Vercel
3. Auto-deploys on every push
4. Get preview URLs for PRs

### Build Locally

```bash
npm run build
npm run start
```

## Troubleshooting

### Issue: Jobs not visible

**Solution**: Ensure:
- Job `startTime` and `endTime` are within current view
- Job `technicianId` matches a technician ID
- Job is in the `jobs` array passed to component

### Issue: Drag not working

**Solution**: Verify:
- Component is wrapped with `GanttContext.Provider`
- `instanceId` is unique per timeline instance
- No console errors in browser DevTools

### Issue: Styling looks wrong

**Solution**: Check:
- Tailwind CSS is properly configured
- Design tokens are in `app/globals.css`
- No conflicting CSS modules

## Next Steps

1. **Explore Examples**: Check `app/examples/` for complete implementations
2. **Read Documentation**: Visit `/docs` for comprehensive guides
3. **Try Playground**: Play with `/playground` to understand features
4. **Check Architecture**: Review `ARCHITECTURE.md` for design patterns
5. **Set Up GitHub**: Follow `GITHUB_SETUP.md` to publish as open source

## Common Patterns

### Real-time Updates with WebSocket

```tsx
useEffect(() => {
  const ws = new WebSocket('ws://your-server');
  
  ws.onmessage = (event) => {
    const updatedJob = JSON.parse(event.data);
    setJobs(jobs => 
      jobs.map(j => j.id === updatedJob.id ? updatedJob : j)
    );
  };
  
  return () => ws.close();
}, []);
```

### Syncing with Backend

```tsx
const handleJobMove = async (config) => {
  try {
    await updateJobAPI(config);
    setJobs(/* updated jobs */);
  } catch (error) {
    console.error('Failed to update job', error);
    // Optionally show error toast
  }
};
```

### Loading State

```tsx
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  setIsLoading(true);
  fetchJobs().then(setJobs).finally(() => setIsLoading(false));
}, [currentDate]);

return (
  <>
    {isLoading && <LoadingSpinner />}
    <GanttContainer {...props} />
  </>
);
```

## Getting Help

- 📖 **Docs**: `/docs` for comprehensive guides
- 🎪 **Playground**: `/playground` for interactive demo
- 🐛 **Issues**: GitHub Issues for bugs
- 💬 **Discussions**: GitHub Discussions for questions
- 📚 **Examples**: `app/examples/` for code samples

---

**Ready to build?** Start with the playground, then copy components to your project!
