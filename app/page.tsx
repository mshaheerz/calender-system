'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import {
  ArrowRight,
  Calendar,
  Users,
  Clock,
  Github,
  ExternalLink,
  Code2,
  Zap,
  Sparkles,
  Shield,
  Palette,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar title="Calendar System" subtitle="Production-ready scheduling components" />

      {/* Hero Section */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center mb-12">
            <Badge className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              Open Source Component Library
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance mb-6 leading-tight">
              Build Beautiful
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                Calendar & Scheduling
              </span>
              Interfaces
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed text-balance">
              A production-ready React component library for creating powerful calendar, scheduling, and
              Gantt chart interfaces with drag-and-drop support, multiple view variants, and full dark/light
              theme support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Link href="/playground">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Try Interactive Demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto bg-transparent">
                  <Code2 className="h-4 w-4" />
                  Read Documentation
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 mb-20">
            <Card className="border-border/50 hover:border-border/80 transition-colors">
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-500 mb-3" />
                <CardTitle>High Performance</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Optimized with React memoization and efficient rendering. Handles hundreds of events
                without lag.
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-border/80 transition-colors">
              <CardHeader>
                <Users className="h-8 w-8 text-green-500 mb-3" />
                <CardTitle>Drag & Drop Ready</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Built on Atlaskit Pragmatic Drag and Drop. Smooth, accessible drag interactions with
                real-time visual feedback.
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-border/80 transition-colors">
              <CardHeader>
                <Clock className="h-8 w-8 text-purple-500 mb-3" />
                <CardTitle>Multiple Views</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Day, Week, Month, Timeline, and Resource Schedule views. Each optimized for its use case
                with responsive layouts.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-muted/30 border-y border-border py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Packed with Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need for professional calendar and scheduling applications
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Calendar,
                  title: 'Multiple View Modes',
                  description:
                    'Day, Week, Month, Timeline, and Resource Schedule views with seamless switching',
                },
                {
                  icon: Sparkles,
                  title: 'Event Interactions',
                  description:
                    'Click to create, drag to move, double-click to edit, resize edges, delete with one click',
                },
                {
                  icon: Palette,
                  title: 'Dark & Light Themes',
                  description:
                    'Full theme support with automatic browser preference detection and localStorage persistence',
                },
                {
                  icon: Shield,
                  title: 'Type Safe',
                  description:
                    'Built with TypeScript. Full type definitions for all components and utilities included',
                },
                {
                  icon: Code2,
                  title: 'Composable Components',
                  description:
                    'Mix and match components. Build complex layouts from simple, reusable pieces',
                },
                {
                  icon: Users,
                  title: 'Resource Management',
                  description:
                    'Track resources, technicians, equipment with availability and allocation views',
                },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="space-y-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Quick Start</h2>
            <p className="text-muted-foreground">Get up and running in minutes</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Installation</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm leading-relaxed">
                  <code>{`npm install date-fns tiny-invariant

# Copy components
cp -r lib/calendar your-project/lib/
cp -r components/calendar your-project/`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Basic Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm leading-relaxed">
                  <code>{`import { Calendar } from '@/components/calendar';
import { CalendarProvider } from '@/lib/calendar';

export default function App() {
  return (
    <CalendarProvider>
      <Calendar />
    </CalendarProvider>
  );
}`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Types */}
        <div className="bg-muted/30 border-y border-border py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Comprehensive Event System</h2>
              <p className="text-muted-foreground">Support for all event types and statuses</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                'Meeting',
                'Task',
                'Appointment',
                'Deadline',
                'Job',
                'Break',
                'Maintenance',
                'Resource Allocation',
              ].map(type => (
                <Card key={type} className="border-border/50">
                  <CardContent className="pt-6 text-center">
                    <p className="font-medium text-sm">{type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Build?</h2>
            <p className="text-lg text-white/90 mb-10">
              Explore the interactive playground or dive into the documentation to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Link href="/playground">
                <Button size="lg" variant="secondary" className="gap-2">
                  Try Playground <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="gap-2 bg-white/10 text-white hover:bg-white/20 border-white/20">
                  Read Docs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  C
                </div>
                <span className="font-bold">Calendar System</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Production-ready calendar and scheduling components with multiple view variants.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/playground" className="text-muted-foreground hover:text-foreground transition-colors">
                    Playground
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/mshaheerz/calender-system.git"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    GitHub <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Views</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Day View</li>
                <li>Week View</li>
                <li>Month View</li>
                <li>Timeline & Gantt</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Built with</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>React & Next.js</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Shadcn/ui</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2024 Calendar System. Open source and free to use.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">
                License
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
