import React from "react"
/**
 * Core types for the Gantt timeline component library
 */

export type ViewMode = 'day' | 'week' | 'month';

export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
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

export interface Technician {
  id: string;
  name: string;
  image?: string | null;
  email?: string;
  phone?: string;
}

export interface GanttTimelineProps {
  technicians: Technician[];
  jobs: Job[];
  viewMode: ViewMode;
  currentDate: Date;
  onJobMove?: (config: JobMoveConfig) => void;
  onJobResize?: (config: JobResizeConfig) => void;
  onJobCreate?: (config: JobCreateConfig) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export interface JobMoveConfig {
  jobId: string;
  toTechnicianId: string;
  newStartTime: Date;
}

export interface JobResizeConfig {
  jobId: string;
  newStartTime?: Date;
  newEndTime?: Date;
}

export interface JobCreateConfig {
  jobData: Omit<Job, 'id'>;
  technicianId: string;
  startTime: Date;
  endTime: Date;
}

export interface DragPreviewData {
  technicianId: string;
  startTime: Date;
  duration: number;
  type: string;
  jobId?: string;
  job?: Job;
}
