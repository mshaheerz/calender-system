'use client';

/**
 * Basic Gantt Timeline Example
 * 
 * This example shows how to implement a simple Gantt timeline
 * with basic drag and drop functionality.
 */

import React, { useState, useMemo } from 'react';
import { GanttContext } from '@/lib/gantt/gantt-context';
import { createGanttRegistry } from '@/lib/gantt/gantt-registry';
import { GanttContainer } from '@/components/gantt/gantt-container';
import type { Job, Technician } from '@/lib/gantt/types';

// Sample data
const TECHNICIANS: Technician[] = [
  { id: '1', name: 'Alice Johnson', image: null },
  { id: '2', name: 'Bob Smith', image: null },
  { id: '3', name: 'Carol Williams', image: null },
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    technicianId: '1',
    title: 'Client Meeting',
    location: 'New York',
    startTime: new Date(2024, 0, 15, 10, 0),
    endTime: new Date(2024, 0, 15, 12, 0),
    status: 'scheduled',
  },
  {
    id: 'job-2',
    technicianId: '2',
    title: 'Site Inspection',
    location: 'Boston',
    startTime: new Date(2024, 0, 15, 9, 0),
    endTime: new Date(2024, 0, 15, 11, 30),
    status: 'in_progress',
  },
  {
    id: 'job-3',
    technicianId: '3',
    title: 'Equipment Setup',
    location: 'Chicago',
    startTime: new Date(2024, 0, 15, 14, 0),
    endTime: new Date(2024, 0, 15, 16, 0),
    status: 'scheduled',
  },
];

export function BasicGanttExample() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [registry] = useState(createGanttRegistry);
  const [instanceId] = useState(() => Symbol('gantt-instance'));
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

  const handleJobMove = ({
    jobId,
    toTechnicianId,
    newStartTime,
  }: {
    jobId: string;
    toTechnicianId: string;
    newStartTime: Date;
  }) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
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
      })
    );
  };

  return (
    <GanttContext.Provider value={contextValue}>
      <GanttContainer
        technicians={TECHNICIANS}
        jobs={jobs}
        viewMode="day"
        currentDate={new Date()}
        onJobMove={handleJobMove}
      />
    </GanttContext.Provider>
  );
}
