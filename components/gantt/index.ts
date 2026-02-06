/**
 * Gantt Timeline Component Library
 * High-performance, accessible timeline/Gantt chart components with drag-and-drop support
 */

export { GanttContainer } from './gantt-container';
export type { GanttContainerProps } from './gantt-container';

export { GanttJobCard } from './gantt-job-card';
export { GanttTechnicianRow } from './gantt-technician-row';
export { GanttMonthCalendar } from './gantt-month-calendar';

export { useGanttContext, GanttContext } from '@/lib/gantt/gantt-context';
export type { GanttContextValue } from '@/lib/gantt/gantt-context';

export { createGanttRegistry } from '@/lib/gantt/gantt-registry';

export type {
  ViewMode,
  JobStatus,
  Job,
  Technician,
  GanttTimelineProps,
  JobMoveConfig,
  JobResizeConfig,
  JobCreateConfig,
  DragPreviewData,
} from '@/lib/gantt/types';
