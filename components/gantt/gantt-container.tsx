"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  format,
  addHours,
  startOfDay,
  eachHourOfInterval,
  endOfDay,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  startOfMonth,
  endOfMonth,
  addMinutes,
  setMinutes,
  setSeconds,
} from "date-fns";
import { useGanttContext } from "@/lib/gantt/gantt-context";
import { GanttTechnicianRow } from "./gantt-technician-row";
import { GanttMonthCalendar } from "./gantt-month-calendar";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import invariant from "tiny-invariant";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type {
  Job,
  ViewMode,
  DragPreviewData,
  JobMoveConfig,
} from "@/lib/gantt/types";

export interface GanttContainerProps {
  technicians: Array<{ id: string; name: string; image?: string | null }>;
  jobs: Job[];
  viewMode: ViewMode;
  currentDate: Date;
  onJobMove?: (config: JobMoveConfig) => void;
  onJobCreate?: (
    jobId: string,
    technicianId: string,
    startTime: Date,
    endTime: Date,
  ) => void;
  onJobResize?: (jobId: string, newStartTime?: Date, newEndTime?: Date) => void;
}

export function GanttContainer({
  technicians,
  jobs,
  viewMode,
  currentDate,
  onJobMove,
  onJobCreate,
  onJobResize,
}: GanttContainerProps) {
  const [dragOverData, setDragOverData] = useState<DragPreviewData | null>(
    null,
  );
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const { instanceId, setIsDragging, isDragEnabled, setIsDragEnabled } =
    useGanttContext();

  // Generate time slots based on view mode
  const timeSlots = useMemo(() => {
    if (viewMode === "day") {
      const start = startOfDay(currentDate);
      const end = endOfDay(currentDate);
      return eachHourOfInterval({ start, end });
    } else if (viewMode === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else if (viewMode === "month") {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachWeekOfInterval({ start, end });
    }
    return [];
  }, [viewMode, currentDate]);

  const getTimeSlotLabel = (slot: Date): string => {
    if (viewMode === "day") {
      return format(slot, "h a");
    } else if (viewMode === "week") {
      return format(slot, "EEE d");
    } else if (viewMode === "month") {
      return format(slot, "MMM d");
    }
    return "";
  };

  const getJobsForTechnician = useCallback(
    (technicianId: string) => {
      return jobs.filter((job) => job.technicianId === technicianId);
    },
    [jobs],
  );

  const handleJobMove = useCallback(
    ({ jobId, toTechnicianId, newStartTime }: JobMoveConfig) => {
      onJobMove?.({ jobId, toTechnicianId, newStartTime });
    },
    [onJobMove],
  );

  const calculatePreciseTime = useCallback(
    ({
      location,
      dropTarget,
      timeSlotTarget,
      source,
    }: {
      location: any;
      dropTarget: any;
      timeSlotTarget: any;
      source: any;
    }): Date => {
      const baseTime =
        dropTarget.data.timeSlot || dropTarget.data.startTime || new Date();
      let finalStartTime = baseTime;

      const grabOffset = source?.data?.grabOffset || 0;
      const rect = dropTarget.element.getBoundingClientRect();
      const offsetX = location.current.input.clientX - rect.left - grabOffset;
      const percentage = Math.max(0, Math.min(1, offsetX / rect.width));

      if (viewMode === "day") {
        if (timeSlotTarget) {
          const minutes = Math.floor(percentage * 60);
          finalStartTime = setMinutes(
            setSeconds(new Date(baseTime), 0),
            minutes,
          );
        } else {
          const totalMinutes = timeSlots.length * 60;
          const minutesToAdd = Math.floor(percentage * totalMinutes);
          finalStartTime = addMinutes(
            startOfDay(new Date(baseTime)),
            minutesToAdd,
          );
        }
      } else if (viewMode === "week") {
        const minutesInCell = 24 * 60;
        const totalMinutes = timeSlotTarget
          ? minutesInCell
          : timeSlots.length * 24 * 60;
        const minutesToAdd = Math.floor(percentage * totalMinutes);
        finalStartTime = addMinutes(
          startOfDay(new Date(baseTime)),
          minutesToAdd,
        );
      } else if (viewMode === "month") {
        const minutesInCell = 7 * 24 * 60;
        const totalMinutes = timeSlotTarget
          ? minutesInCell
          : timeSlots.length * 7 * 24 * 60;
        const minutesToAdd = Math.floor(percentage * totalMinutes);
        finalStartTime = addMinutes(
          startOfDay(new Date(baseTime)),
          minutesToAdd,
        );
      }
      return finalStartTime;
    },
    [viewMode, timeSlots],
  );

  // Setup auto-scroll
  useEffect(() => {
    if (!timelineScrollRef.current) return;

    return autoScrollForElements({
      element: timelineScrollRef.current,
      canScroll: ({ source }) => source.data.instanceId === instanceId,
    });
  }, [instanceId]);

  // Monitor drag and drop events
  useEffect(() => {
    return combine(
      monitorForElements({
        canMonitor({ source }) {
          return isDragEnabled && source.data.instanceId === instanceId;
        },
        onDragStart() {
          setIsDragging(true);
        },
        onDrag(args) {
          const { location, source } = args;
          const isJobAction =
            source.data.type === "job-card" ||
            source.data.type === "table-job" ||
            source.data.type === "job-resize" ||
            source.data.type === "job-resize-start" ||
            source.data.type === "job-resize-end";

          if (isJobAction && location.current.dropTargets.length) {
            const gridTarget = location.current.dropTargets.find(
              (target: any) => (target.data as any).isGrid === true,
            );
            const timeSlotTarget = location.current.dropTargets.find(
              (target: any) => (target.data as any).timeSlot !== undefined,
            );

            const dropTarget = gridTarget || timeSlotTarget;

            if (dropTarget) {
              const calculationTarget = gridTarget || dropTarget;
              const calculationTimeSlotTarget = gridTarget
                ? null
                : timeSlotTarget;

              const finalStartTime = calculatePreciseTime({
                location,
                dropTarget: calculationTarget,
                timeSlotTarget: calculationTimeSlotTarget,
                source,
              });

              let startTime = finalStartTime;
              let duration = 2 * 60 * 60 * 1000; // Default 2h

              const sourceData = source.data as any;

              if (
                sourceData.type === "job-card" ||
                sourceData.type === "job-resize" ||
                sourceData.type === "job-resize-start" ||
                sourceData.type === "job-resize-end"
              ) {
                const job = jobs.find((j) => j.id === sourceData.jobId);
                if (job) {
                  if (
                    sourceData.type === "job-resize" ||
                    sourceData.type === "job-resize-end"
                  ) {
                    startTime = job.startTime;
                    duration = Math.max(
                      15 * 60 * 1000,
                      finalStartTime.getTime() - job.startTime.getTime(),
                    );
                  } else if (sourceData.type === "job-resize-start") {
                    const newDuration =
                      job.endTime.getTime() - finalStartTime.getTime();
                    if (newDuration >= 15 * 60 * 1000) {
                      startTime = finalStartTime;
                      duration = newDuration;
                    }
                  } else {
                    duration = job.endTime.getTime() - job.startTime.getTime();
                  }
                }
              }

              setDragOverData({
                technicianId: (dropTarget.data as any).technicianId,
                startTime,
                duration,
                type: sourceData.type,
                jobId: sourceData.jobId,
                job:
                  sourceData.job || jobs.find((j) => j.id === sourceData.jobId),
              });
            } else {
              setDragOverData(null);
            }
          } else {
            setDragOverData(null);
          }
        },
        onDrop(args) {
          setIsDragging(false);
          setDragOverData(null);
          const { location, source } = args;

          if (!location.current.dropTargets.length) {
            return;
          }

          const sourceData = source.data as any;
          const isJobAction =
            sourceData.type === "job-card" ||
            sourceData.type === "table-job" ||
            sourceData.type === "job-resize" ||
            sourceData.type === "job-resize-start" ||
            sourceData.type === "job-resize-end";

          if (isJobAction) {
            const timeSlotTarget = location.current.dropTargets.find(
              (target: any) => (target.data as any).timeSlot !== undefined,
            );
            const gridTarget = location.current.dropTargets.find(
              (target: any) => (target.data as any).isGrid === true,
            );

            const dropTarget =
              gridTarget || timeSlotTarget || location.current.dropTargets[0];
            const toTechnicianId = (dropTarget.data as any).technicianId;

            const calculationTarget = gridTarget || dropTarget;
            const calculationTimeSlotTarget = gridTarget
              ? null
              : timeSlotTarget;

            const finalStartTime = calculatePreciseTime({
              location,
              dropTarget: calculationTarget,
              timeSlotTarget: calculationTimeSlotTarget,
              source,
            });

            invariant(typeof toTechnicianId === "string");

            if (sourceData.type === "table-job") {
              const tableJob = sourceData.job;
              onJobCreate?.(
                tableJob.id,
                toTechnicianId,
                finalStartTime,
                addHours(finalStartTime, 2),
              );
            } else if (sourceData.type === "job-card") {
              const jobId = sourceData.jobId;
              invariant(typeof jobId === "string");
              handleJobMove({
                jobId,
                toTechnicianId,
                newStartTime: finalStartTime,
              });
            } else if (
              sourceData.type === "job-resize" ||
              sourceData.type === "job-resize-end"
            ) {
              const jobId = sourceData.jobId;
              invariant(typeof jobId === "string");
              onJobResize?.(
                jobId,
                undefined,
                finalStartTime >
                  (jobs.find((j) => j.id === jobId)?.startTime || new Date())
                  ? finalStartTime
                  : undefined,
              );
            } else if (sourceData.type === "job-resize-start") {
              const jobId = sourceData.jobId;
              invariant(typeof jobId === "string");
              onJobResize?.(jobId, finalStartTime, undefined);
            }
          }
        },
      }),
    );
  }, [
    instanceId,
    handleJobMove,
    calculatePreciseTime,
    jobs,
    onJobCreate,
    onJobResize,
    isDragEnabled,
    setIsDragging,
  ]);

  return (
    <Card className="border-b-0 border-x-0 border-t shadow-lg rounded-none overflow-hidden bg-background">
      <CardContent className="p-0 border-none shadow-none">
        {viewMode === "month" ? (
          <GanttMonthCalendar
            technicians={technicians}
            jobs={jobs}
            currentDate={currentDate}
            onJobMove={handleJobMove}
          />
        ) : (
          <div
            ref={timelineScrollRef}
            className="overflow-x-auto overflow-y-auto custom-scrollbar"
            style={{ maxHeight: "50vh" }}
          >
            {/* Time Header with Drag Toggle */}
            <div className="flex border-b sticky top-0 bg-background/95 backdrop-blur-sm z-20 min-w-max">
              <div className="w-48 flex-shrink-0 border-r p-3 font-semibold bg-muted/30 flex items-center justify-between">
                <span>Technician</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="drag-toggle-container"
                    checked={isDragEnabled}
                    onCheckedChange={setIsDragEnabled}
                    className="data-[state=checked]:bg-emerald-500 scale-75"
                  />
                  <Label
                    htmlFor="drag-toggle-container"
                    className="text-[9px] font-bold cursor-pointer select-none"
                    title={isDragEnabled ? "Drag Enabled" : "Drag Disabled"}
                  >
                    {isDragEnabled ? "🟢" : "🔴"}
                  </Label>
                </div>
              </div>
              <div className="flex flex-1 min-w-max relative">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-1 p-2 text-center text-sm font-medium bg-muted/20 border-r",
                      viewMode === "week" ? "min-w-[300px]" : "min-w-[100px]",
                    )}
                  >
                    {getTimeSlotLabel(slot)}
                  </div>
                ))}
                {dragOverData && (
                  <div
                    className="absolute top-0 bottom-0 z-30 pointer-events-none transition-all duration-75"
                    style={{
                      left: `${((dragOverData.startTime.getTime() - timeSlots[0].getTime()) / (timeSlots[timeSlots.length - 1].getTime() + (viewMode === "day" ? 3600000 : viewMode === "week" ? 86400000 : 604800000) - timeSlots[0].getTime())) * 100}%`,
                    }}
                  >
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-md whitespace-nowrap">
                      {format(dragOverData.startTime, "h:mm a")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technician Rows */}
            <div className="relative min-w-max">
              {technicians.map((technician) => (
                <GanttTechnicianRow
                  key={technician.id}
                  technician={technician}
                  jobs={getJobsForTechnician(technician.id)}
                  timeSlots={timeSlots}
                  viewMode={viewMode}
                  dragPreview={
                    dragOverData?.technicianId === technician.id
                      ? dragOverData
                      : null
                  }
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
