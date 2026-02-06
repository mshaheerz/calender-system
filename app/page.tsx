'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Calendar,
  Users,
  Clock,
  Github,
  ExternalLink,
  Code2,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-grey-50 via-white to-grey-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-grey-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-brand-600" />
              <span className="font-bold text-lg text-grey-900">Gantt Timeline</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/docs" className="text-grey-600 hover:text-grey-900 font-medium">
                Docs
              </Link>
              <Link href="/playground" className="text-grey-600 hover:text-grey-900 font-medium">
                Playground
              </Link>
              <a
                href="https://github.com/yourusername/gantt-timeline"
                target="_blank"
                rel="noopener noreferrer"
                className="text-grey-600 hover:text-grey-900"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center mb-12">
          <Badge className="mb-4 px-4 py-2 text-base bg-brand-50 text-brand-700 border-brand-200">
            Open Source Component Library
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-grey-900 mb-6 leading-tight">
            Build Interactive
            <span className="block text-brand-600">Timeline & Gantt Charts</span>
          </h1>
          <p className="text-xl text-grey-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            A production-ready React component library for creating beautiful, interactive timeline
            and Gantt chart interfaces with drag-and-drop support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/playground">
                Try Live Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 bg-transparent">
              <Link href="/docs">
                <Code2 className="h-4 w-4" />
                Read Docs
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 bg-transparent"
            >
              <a
                href="https://github.com/yourusername/gantt-timeline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <Card className="border-grey-200">
            <CardHeader>
              <Zap className="h-8 w-8 text-brand-600 mb-3" />
              <CardTitle>High Performance</CardTitle>
            </CardHeader>
            <CardContent className="text-grey-600">
              Optimized with React memoization and efficient state management. Handles hundreds of
              events without lag.
            </CardContent>
          </Card>

          <Card className="border-grey-200">
            <CardHeader>
              <Users className="h-8 w-8 text-brand-600 mb-3" />
              <CardTitle>Drag & Drop Ready</CardTitle>
            </CardHeader>
            <CardContent className="text-grey-600">
              Built on Atlaskit Pragmatic Drag and Drop. Smooth, accessible drag interactions
              with real-time preview.
            </CardContent>
          </Card>

          <Card className="border-grey-200">
            <CardHeader>
              <Clock className="h-8 w-8 text-brand-600 mb-3" />
              <CardTitle>Multiple Views</CardTitle>
            </CardHeader>
            <CardContent className="text-grey-600">
              Switch between day, week, and month views. Each optimized for its use case with
              responsive layouts.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Code Example Section */}
      <div className="bg-white border-y border-grey-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-grey-900 mb-8">Quick Start</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-grey-900 mb-4">Installation</h3>
              <pre className="bg-grey-900 text-grey-50 p-4 rounded-lg overflow-auto text-sm leading-relaxed">
                {`npm install @atlaskit/pragmatic-drag-and-drop \\
  date-fns tiny-invariant

# Copy components to your project
cp -r components/gantt your-project/`}
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-grey-900 mb-4">Basic Usage</h3>
              <pre className="bg-grey-900 text-grey-50 p-4 rounded-lg overflow-auto text-sm leading-relaxed">
                {`<GanttContainer
  technicians={technicians}
  jobs={jobs}
  viewMode="day"
  currentDate={new Date()}
  onJobMove={handleJobMove}
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-grey-900 mb-12">Key Features</h2>
        <div className="space-y-6">
          {[
            {
              title: 'TypeScript Support',
              description: 'Full type safety with comprehensive type definitions and interfaces.',
            },
            {
              title: 'Composable Architecture',
              description:
                'Build complex timelines from reusable, independent components. Mix and match as needed.',
            },
            {
              title: 'Accessible',
              description:
                'Built with accessibility in mind. Keyboard navigation, ARIA labels, and semantic HTML.',
            },
            {
              title: 'Themeable',
              description:
                'Customize colors, spacing, and styling using Tailwind CSS and design tokens.',
            },
            {
              title: 'Real-time Feedback',
              description:
                'Live preview of job placement, auto-scrolling, and smooth animations during drag.',
            },
            {
              title: 'Resize Support',
              description:
                'Drag job edges to resize start/end times. Enforces minimum duration constraints.',
            },
          ].map((feature, idx) => (
            <Card key={idx} className="border-grey-200">
              <CardHeader>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-grey-600">{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-xl text-brand-100 mb-8">
            Explore the interactive playground or dive into the documentation to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-brand-600 hover:bg-grey-50">
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
              <Link href="/docs">
                <Code2 className="mr-2 h-4 w-4" />
                Documentation
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-grey-200 bg-grey-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-brand-600" />
                <span className="font-bold text-grey-900">Gantt Timeline</span>
              </div>
              <p className="text-grey-600 text-sm">
                Open source component library for building interactive timelines.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-grey-900 mb-3">Library</h3>
              <ul className="space-y-2 text-sm text-grey-600">
                <li>
                  <Link href="/playground" className="hover:text-brand-600">
                    Playground
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-brand-600">
                    Documentation
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Components
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-grey-900 mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-grey-600">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-600 flex items-center gap-1"
                  >
                    GitHub <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://atlaskit.atlassian.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-600 flex items-center gap-1"
                  >
                    Atlaskit <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-grey-900 mb-3">Built with</h3>
              <ul className="space-y-2 text-sm text-grey-600">
                <li>React & TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Shadcn/ui</li>
                <li>Date-fns</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-grey-200 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-grey-600 text-sm">
              &copy; 2024 Gantt Timeline. Open source and free to use.
            </p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="text-grey-600 hover:text-grey-900 text-sm">
                License
              </a>
              <a href="#" className="text-grey-600 hover:text-grey-900 text-sm">
                Privacy
              </a>
              <a href="#" className="text-grey-600 hover:text-grey-900 text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
