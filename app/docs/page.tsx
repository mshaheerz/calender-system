'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';
import { Navbar } from '@/components/navbar';

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar
        title="Documentation"
        subtitle="Complete guide to the Calendar & Scheduling System"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto max-w-4xl mx-auto w-full px-4 py-12">
        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Installation</CardTitle>
              <CardDescription>Add the calendar system to your Next.js project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg relative">
                <pre className="text-sm overflow-auto">
                  <code>{`npm install date-fns tiny-invariant

# Copy components to your project
cp -r lib/calendar your-project/lib/
cp -r components/calendar your-project/components/`}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard('npm install date-fns tiny-invariant')}
                  className="absolute top-2 right-2 p-2 hover:bg-background rounded transition-colors"
                >
                  {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Set up a working calendar in minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Step 1: Wrap with CalendarProvider</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      <code>{`import { CalendarProvider } from '@/lib/calendar/calendar-context';
import { Calendar } from '@/components/calendar';
import { mockEvents, mockResources } from '@/lib/calendar/mock-data';

export default function Page() {
  return (
    <CalendarProvider
      initialEvents={mockEvents}
      initialResources={mockResources}
    >
      <Calendar />
    </CalendarProvider>
  );
}`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Step 2: Use in layout.tsx</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      <code>{`import { ThemeProvider } from '@/lib/calendar/theme';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider defaultMode="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Views */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">View Variants</h2>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Day View</CardTitle>
                <CardDescription>Hourly schedule with time slots and all-day events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Features:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Hour-by-hour schedule view</li>
                    <li>All-day events section at the top</li>
                    <li>Drag events to reschedule</li>
                    <li>Double-click to create new events</li>
                    <li>Delete events with close button</li>
                  </ul>
                  <div className="bg-muted p-3 rounded text-xs font-mono mt-4">
                    &lt;DayView date={'{date}'} startHour={6} endHour={22} /&gt;
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Week View</CardTitle>
                <CardDescription>7-day calendar with hourly grid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Features:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>7-column layout for each day</li>
                    <li>Sticky time labels</li>
                    <li>Drag events across days</li>
                    <li>Multi-hour event support</li>
                    <li>Resource color coding</li>
                  </ul>
                  <div className="bg-muted p-3 rounded text-xs font-mono mt-4">
                    &lt;WeekView date={'{date}'} showResources /&gt;
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Month View</CardTitle>
                <CardDescription>Calendar grid with optional drag support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Features:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Full month calendar grid</li>
                    <li>Toggle drag mode on/off</li>
                    <li>Event count per day</li>
                    <li>Click to view day details</li>
                    <li>Smooth navigation</li>
                  </ul>
                  <div className="bg-muted p-3 rounded text-xs font-mono mt-4">
                    &lt;MonthView date={'{date}'} dragEnabled={'{true}'} /&gt;
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Schedule</CardTitle>
                <CardDescription>View all resources with their schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Features:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Group by resource/department</li>
                    <li>Expandable resource rows</li>
                    <li>Real-time availability</li>
                    <li>Resource allocation view</li>
                    <li>Color-coded by resource</li>
                  </ul>
                  <div className="bg-muted p-3 rounded text-xs font-mono mt-4">
                    &lt;ResourceSchedule date={'{date}'} /&gt;
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Event Types */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Event Types</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Meeting', color: 'bg-blue-500' },
                  { name: 'Task', color: 'bg-purple-500' },
                  { name: 'Appointment', color: 'bg-green-500' },
                  { name: 'Deadline', color: 'bg-red-500' },
                  { name: 'Job', color: 'bg-yellow-500' },
                  { name: 'Break', color: 'bg-gray-500' },
                  { name: 'Maintenance', color: 'bg-orange-500' },
                  { name: 'Resource Alloc', color: 'bg-indigo-500' },
                ].map(type => (
                  <div key={type.name} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${type.color}`} />
                    <span className="text-sm">{type.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Event Statuses */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Event Statuses</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">pending</span> - Not yet started</p>
                <p><span className="font-semibold">in-progress</span> - Currently active</p>
                <p><span className="font-semibold">scheduled</span> - Planned for future</p>
                <p><span className="font-semibold">completed</span> - Finished</p>
                <p><span className="font-semibold">cancelled</span> - Cancelled/voided</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Theme System */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Theme System</h2>
          <Card>
            <CardHeader>
              <CardTitle>Dark & Light Mode</CardTitle>
              <CardDescription>Built-in theme support with persistence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Using the Theme Hook</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      <code>{`import { useTheme } from '@/lib/calendar/theme';

export function MyComponent() {
  const { mode, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current mode: {mode}
    </button>
  );
}`}</code>
                    </pre>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-1">Note:</p>
                  <p>Theme preference is automatically saved to localStorage and persists across sessions.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* API Reference */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">API Reference</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>useCalendarContext()</CardTitle>
              <CardDescription>Access calendar state and methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg text-sm space-y-2 font-mono">
                <p className="text-muted-foreground">// Returns:</p>
                <p className="text-muted-foreground">{`{`}</p>
                <p className="ml-4">events: CalendarEvent[]</p>
                <p className="ml-4">resources: Resource[]</p>
                <p className="ml-4">selectedDate: Date</p>
                <p className="ml-4">viewMode: ViewMode</p>
                <p className="ml-4">themeMode: ThemeMode</p>
                <p className="ml-4">dragEnabled: boolean</p>
                <p className="ml-4">addEvent: (event) =&gt; void</p>
                <p className="ml-4">updateEvent: (id, changes) =&gt; void</p>
                <p className="ml-4">deleteEvent: (id) =&gt; void</p>
                <p className="ml-4">selectDate: (date) =&gt; void</p>
                <p className="ml-4">setViewMode: (mode) =&gt; void</p>
                <p className="ml-4">setThemeMode: (mode) =&gt; void</p>
                <p className="text-muted-foreground">{`}`}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Support */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Support & Resources</h2>
          <div className="grid gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">GitHub Repository</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      View source code, open issues, and contribute to the project.
                    </p>
                    <a href="#" className="text-primary font-semibold text-sm">
                      github.com/your-org/calendar-system →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">TypeScript Types</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Full type definitions available at lib/calendar/types.ts
                    </p>
                    <code className="text-primary font-mono text-sm">
                      lib/calendar/types.ts
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to build?</h2>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/playground">
              <Button size="lg">Try Interactive Demo</Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">Back to Home</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
