'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Code2, Zap, Layers, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Zap,
    title: 'High Performance',
    description: 'Optimized rendering with memo and efficient state management',
  },
  {
    icon: Layers,
    title: 'Composable',
    description: 'Build complex timelines from reusable, independent components',
  },
  {
    icon: Code2,
    title: 'TypeScript',
    description: 'Full type safety with comprehensive type definitions',
  },
  {
    icon: 'drag-drop',
    title: 'Drag & Drop',
    description: 'Powered by @atlaskit/pragmatic-drag-and-drop',
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-grey-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Gantt Timeline Library</h1>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl">
            A production-ready, open-source component library for building interactive timeline and Gantt chart interfaces with React.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-white text-brand-600 hover:bg-grey-50"
            >
              <Link href="/playground">
                Try Playground <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-brand-600 bg-transparent"
            >
              <a
                href="https://github.com/yourusername/gantt-timeline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {FEATURES.map((feature) => {
            const Icon = feature.icon === 'drag-drop' ? null : feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  {Icon && <Icon className="h-8 w-8 text-brand-600 mb-3" />}
                  {feature.icon === 'drag-drop' && (
                    <div className="h-8 w-8 text-brand-600 mb-3 flex items-center justify-center">
                      ⇄
                    </div>
                  )}
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-grey-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Installation */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Installation</CardTitle>
            <CardDescription>Get started with the Gantt Timeline library</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">1. Copy the components</h3>
              <p className="text-grey-600 mb-4">
                Copy the Gantt components from this repository to your project:
              </p>
              <pre className="bg-grey-900 text-grey-50 p-4 rounded-lg overflow-auto text-sm">
                {`cp -r components/gantt your-project/components/
cp -r lib/gantt your-project/lib/`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">2. Install dependencies</h3>
              <pre className="bg-grey-900 text-grey-50 p-4 rounded-lg overflow-auto text-sm">
                {`npm install @atlaskit/pragmatic-drag-and-drop \\
  @atlaskit/pragmatic-drag-and-drop-auto-scroll \\
  date-fns tiny-invariant`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">3. Wrap with GanttContext</h3>
              <pre className="bg-grey-900 text-grey-50 p-4 rounded-lg overflow-auto text-sm">
                {`import { GanttContext } from '@/lib/gantt/gantt-context';
import { createGanttRegistry } from '@/lib/gantt/gantt-registry';

export default function YourPage() {
  const [registry] = useState(createGanttRegistry);
  const [instanceId] = useState(() => Symbol('gantt'));

  return (
    <GanttContext.Provider value={{
      instanceId,
      registerJobCard: registry.registerJobCard,
      registerTechnicianRow: registry.registerTechnicianRow,
      viewMode: 'day',
      isDragging: false,
      setIsDragging: () => {},
    }}>
      {/* Your content */}
    </GanttContext.Provider>
  );
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Basic Usage</CardTitle>
            <CardDescription>Implement the Gantt timeline in your app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <pre className="bg-grey-900 text-grey-50 p-4 rounded-lg overflow-auto text-sm">
              {`import { GanttContainer } from '@/components/gantt';
import type { Job } from '@/lib/gantt/types';

export default function SchedulePage() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'job-1',
      technicianId: '1',
      title: 'Service Visit',
      startTime: new Date(),
      endTime: new Date(Date.now() + 2*60*60*1000),
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
        // Handle job move
      }}
      onJobCreate={(jobId, technicianId, startTime, endTime) => {
        // Handle job creation
      }}
      onJobResize={(jobId, newStartTime, newEndTime) => {
        // Handle job resize
      }}
    />
  );
}`}
            </pre>
          </CardContent>
        </Card>

        {/* API Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GanttContainer Props</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <code className="font-mono bg-grey-100 px-2 py-1 rounded text-brand-600">
                  technicians
                </code>
                <p className="text-grey-600 mt-1">Array of technician objects with id and name</p>
              </div>
              <div>
                <code className="font-mono bg-grey-100 px-2 py-1 rounded text-brand-600">
                  jobs
                </code>
                <p className="text-grey-600 mt-1">Array of Job objects with schedule details</p>
              </div>
              <div>
                <code className="font-mono bg-grey-100 px-2 py-1 rounded text-brand-600">
                  viewMode
                </code>
                <p className="text-grey-600 mt-1">&apos;day&apos; | &apos;week&apos; | &apos;month&apos;</p>
              </div>
              <div>
                <code className="font-mono bg-grey-100 px-2 py-1 rounded text-brand-600">
                  currentDate
                </code>
                <p className="text-grey-600 mt-1">Current date for the timeline viewport</p>
              </div>
              <div>
                <code className="font-mono bg-grey-100 px-2 py-1 rounded text-brand-600">
                  onJobMove
                </code>
                <p className="text-grey-600 mt-1">Callback when a job is moved</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Type Definition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <pre className="bg-grey-100 p-3 rounded-lg overflow-auto text-xs">
                {`interface Job {
  id: string;
  technicianId: string;
  title: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  status: JobStatus;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
}`}
              </pre>
              <p className="text-grey-600">
                <code className="font-mono bg-grey-100 px-2 py-1 rounded">
                  JobStatus
                </code>
                : &apos;scheduled&apos; | &apos;in_progress&apos; | &apos;completed&apos; | &apos;cancelled&apos;
              </p>
            </CardContent>
          </Card>
        </div>

        {/* View Modes */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>View Modes</CardTitle>
            <CardDescription>Switch between different timeline perspectives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Badge>Day View</Badge>
                <p className="text-grey-600">
                  Hour-by-hour timeline showing jobs throughout a single day. Perfect for detailed scheduling.
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="brand">Week View</Badge>
                <p className="text-grey-600">
                  Daily blocks across a week. Great for medium-term planning and resource allocation.
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="success">Month View</Badge>
                <p className="text-grey-600">
                  Calendar-based layout showing entire months. Ideal for high-level planning.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drag and Drop */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Drag & Drop Features</CardTitle>
            <CardDescription>Powered by Atlaskit Pragmatic Drag and Drop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Moving Jobs</h4>
                <p className="text-grey-600">
                  Drag any job card to move it to a different technician or time slot. The timeline automatically calculates the precise start time based on drop location.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Resizing Jobs</h4>
                <p className="text-grey-600">
                  Hover over a job to reveal resize handles. Drag the left edge to adjust start time or the right edge to adjust end time. Minimum duration is 15 minutes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Auto-scrolling</h4>
                <p className="text-grey-600">
                  When dragging near edges, the timeline automatically scrolls to reveal more content. Smooth and responsive scrolling support.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Visual Feedback</h4>
                <p className="text-grey-600">
                  Real-time preview shows where the job will land. Cards highlight during drag, and drop zones show enhanced styling.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GitHub */}
        <Card className="border-brand-200 bg-brand-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Open Source on GitHub
            </CardTitle>
            <CardDescription>Contribute, report issues, or fork the project</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-grey-600 mb-4">
              This library is open source and actively maintained. We welcome contributions, bug reports, and feature suggestions.
            </p>
            <Button
              asChild
              variant="default"
              className="gap-2"
            >
              <a
                href="https://github.com/yourusername/gantt-timeline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
