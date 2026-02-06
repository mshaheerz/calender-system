'use client';

import React, { useState, useMemo } from 'react';
import { GanttContext } from '@/lib/gantt/gantt-context';
import { createGanttRegistry } from '@/lib/gantt/gantt-registry';
import { GanttContainer } from '@/components/gantt/gantt-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Job, ViewMode } from '@/lib/gantt/types';
import { addHours, addDays, startOfDay, subDays } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MOCK_TECHNICIANS = [
  { id: '1', name: 'Shritha Kishor', image: null },
  { id: '2', name: 'Baijwan Paraker', image: null },
  { id: '3', name: 'Aahva Bansal', image: null },
  { id: '4', name: 'Madhura Chad', image: null },
  { id: '5', name: 'Malaimagai RS', image: null },
  { id: '6', name: 'Aapt Nandan', image: null },
  { id: '7', name: 'Benoy Kumari', image: null },
  { id: '8', name: 'Ravi Kiran', image: null },
];

const generateMockJobs = (baseDate: Date): Job[] => [
  {
    id: 'job-1',
    technicianId: '1',
    title: 'Scheduled Service Visit',
    location: 'Chennai',
    startTime: addHours(startOfDay(baseDate), 10),
    endTime: addHours(startOfDay(baseDate), 12),
    status: 'scheduled',
  },
  {
    id: 'job-2',
    technicianId: '1',
    title: 'Emergency Repair',
    location: 'Chennai',
    startTime: addHours(startOfDay(baseDate), 14),
    endTime: addHours(startOfDay(baseDate), 16),
    status: 'scheduled',
  },
  {
    id: 'job-3',
    technicianId: '2',
    title: 'Installation Work',
    location: 'Erode',
    startTime: addHours(startOfDay(baseDate), 9),
    endTime: addHours(startOfDay(baseDate), 13),
    status: 'in_progress',
  },
  {
    id: 'job-4',
    technicianId: '3',
    title: 'Maintenance Check',
    location: 'Chennai',
    startTime: addHours(startOfDay(baseDate), 11),
    endTime: addHours(startOfDay(baseDate), 14),
    status: 'scheduled',
  },
  {
    id: 'job-5',
    technicianId: '4',
    title: 'Repair & Service',
    location: 'Bangalore',
    startTime: addHours(startOfDay(baseDate), 10),
    endTime: addHours(startOfDay(baseDate), 15),
    status: 'completed',
  },
  {
    id: 'job-6',
    technicianId: '5',
    title: 'Site Survey',
    location: 'Pune',
    startTime: addHours(startOfDay(baseDate), 8),
    endTime: addHours(startOfDay(baseDate), 10),
    status: 'scheduled',
  },
];

export default function PlaygroundPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [jobs, setJobs] = useState<Job[]>(() => generateMockJobs(new Date()));

  const [registry] = useState(createGanttRegistry);
  const [instanceId] = useState(() => Symbol('gantt-instance'));
  const [isDragging, setIsDragging] = useState(false);

  const contextValue = useMemo(() => {
    return {
      instanceId,
      registerJobCard: registry.registerJobCard,
      registerTechnicianRow: registry.registerTechnicianRow,
      viewMode,
      isDragging,
      setIsDragging,
    };
  }, [instanceId, registry, viewMode, isDragging]);

  const handleJobMove = ({
    jobId,
    toTechnicianId,
    newStartTime,
  }: {
    jobId: string;
    toTechnicianId: string;
    newStartTime: Date;
  }) => {
    setJobs((prevJobs) => {
      return prevJobs.map((job) => {
        if (job.id === jobId) {
          const duration = job.endTime.getTime() - job.startTime.getTime();
          return {
            ...job,
            technicianId: toTechnicianId,
            startTime: newStartTime,
            endTime: new Date(newStartTime.getTime() + duration),
          };
        }
        return job;
      });
    });
  };

  const handleJobCreate = (
    jobId: string,
    technicianId: string,
    startTime: Date,
    endTime: Date
  ) => {
    setJobs((prevJobs) => [
      ...prevJobs,
      {
        id: `${jobId}-assigned-${Date.now()}`,
        technicianId,
        title: 'New Assignment',
        location: 'TBD',
        startTime,
        endTime,
        status: 'scheduled',
      },
    ]);
  };

  const handleJobResize = (
    jobId: string,
    newStartTime?: Date,
    newEndTime?: Date
  ) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            startTime: newStartTime ?? job.startTime,
            endTime: newEndTime ?? job.endTime,
          };
        }
        return job;
      })
    );
  };

  const handlePreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grey-50 to-grey-100">
      <GanttContext.Provider value={contextValue}>
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-grey-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-grey-900">Gantt Timeline Playground</h1>
                <p className="text-grey-600 mt-1">
                  Interactive demonstration of the timeline component library
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="brand" className="text-base px-3 py-2">
                  Open Source
                </Badge>
                <Badge variant="grey" className="text-base px-3 py-2">
                  Drag Enabled
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border-b border-grey-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-grey-700">View Mode:</span>
                <Select value={viewMode} onValueChange={(val) => setViewMode(val as ViewMode)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day View</SelectItem>
                    <SelectItem value="week">Week View</SelectItem>
                    <SelectItem value="month">Month View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousDay}
                  className="gap-2 bg-transparent"
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="min-w-24 bg-transparent"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextDay}
                  className="gap-2 bg-transparent"
                >
                  Next →
                </Button>
              </div>

              <div className="text-sm font-medium text-grey-700 bg-grey-50 px-3 py-2 rounded-md">
                {currentDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Timeline</CardTitle>
                <CardDescription>
                  Drag jobs between technicians and across time slots. Resize jobs by dragging their edges.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GanttContainer
                  technicians={MOCK_TECHNICIANS}
                  jobs={jobs}
                  viewMode={viewMode}
                  currentDate={currentDate}
                  onJobMove={handleJobMove}
                  onJobCreate={handleJobCreate}
                  onJobResize={handleJobResize}
                />
              </CardContent>
            </Card>
          </div>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-grey-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-grey-900">{jobs.length}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-grey-600">Technicians</p>
                  <p className="text-2xl font-bold text-grey-900">{MOCK_TECHNICIANS.length}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-grey-600">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {jobs.filter((j) => j.status === 'scheduled').length}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-grey-600">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {jobs.filter((j) => j.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </GanttContext.Provider>
    </div>
  );
}
