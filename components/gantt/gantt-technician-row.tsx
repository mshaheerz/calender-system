"use client";

import { useRef, useEffect, memo, useCallback, useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GanttJobCard } from "./gantt-job-card";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { useGanttContext } from "@/lib/gantt/gantt-context";
import { addHours, addDays, addWeeks } from "date-fns";
import { cn } from "@/lib/utils";

export const GanttTechnicianRow = memo(
  ({ technician, jobs, timeSlots, viewMode, dragPreview }) => {
    const rowRef = useRef(null);
    const gridRef = useRef(null);
    const { instanceId, registerTechnicianRow, isDragging } = useGanttContext();

    useEffect(() => {
      if (!rowRef.current || !gridRef.current) return;

      return combine(
        registerTechnicianRow({
          technicianId: technician.id,
          entry: {
            element: rowRef.current,
          },
        }),
        dropTargetForElements({
          element: gridRef.current,
          getData: () => ({
            technicianId: technician.id,
            isGrid: true,
            startTime: timeSlots[0],
          }),
          canDrop: ({ source }) => {
            return (
              source.data.instanceId === instanceId &&
              (source.data.type === "job-card" ||
                source.data.type === "table-job" ||
                source.data.type === "job-resize" ||
                source.data.type === "job-resize-start" ||
                source.data.type === "job-resize-end")
            );
          },
          getIsSticky: () => true,
        }),
      );
    }, [technician.id, instanceId, registerTechnicianRow, timeSlots]);

    // Calculate job position based on time
    const getJobPosition = useCallback(
      (job) => {
        const start = timeSlots[0];
        const lastSlot = timeSlots[timeSlots.length - 1];
        const end =
          viewMode === "day"
            ? addHours(lastSlot, 1)
            : viewMode === "week"
              ? addDays(lastSlot, 1)
              : addWeeks(lastSlot, 1);

        const totalInterval = end.getTime() - start.getTime();
        const jobStartTime = job.startTime.getTime();
        const jobEndTime = job.endTime.getTime();
        const viewStartTime = start.getTime();
        const viewEndTime = end.getTime();

        // Calculate visible start and end within the grid
        const visibleStart = Math.max(viewStartTime, jobStartTime);
        const visibleEnd = Math.min(viewEndTime, jobEndTime);

        if (visibleStart >= visibleEnd) {
          return { left: "0%", width: "0%", display: "none" };
        }

        const left = ((visibleStart - viewStartTime) / totalInterval) * 100;
        const width = ((visibleEnd - visibleStart) / totalInterval) * 100;

        return {
          left: `${left}%`,
          width: `${width}%`,
        };
      },
      [viewMode, timeSlots],
    );

    const { positionedJobs, previewItem, totalLanes } = useMemo(() => {
      // Filter out the job being moved/resized from normal positioning
      const sourceJobId = dragPreview?.jobId;
      const filteredJobs = jobs.filter((j) => j.id !== sourceJobId);

      // Create a virtual job for the preview
      let virtualPreview = null;
      if (dragPreview) {
        // Use the job object passed from the drag monitor
        const originalJob = dragPreview.job || {};

        virtualPreview = {
          ...originalJob,
          id: "preview",
          startTime: dragPreview.startTime,
          endTime: new Date(
            dragPreview.startTime.getTime() + dragPreview.duration,
          ),
          isPreview: true,
          status: originalJob.status || "scheduled", // Fallback
          title: originalJob.title || "New Assignment", // Fallback
          location: originalJob.location,
        };
      }

      // Combine and sort
      const allItems = [...filteredJobs];
      if (virtualPreview) allItems.push(virtualPreview);

      allItems.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      const lanes = [];
      let finalPreviewItem = null;
      const result = [];

      allItems.forEach((item) => {
        let laneIndex = lanes.findIndex(
          (lastEndTime) => item.startTime.getTime() >= lastEndTime.getTime(),
        );

        if (laneIndex === -1) {
          laneIndex = lanes.length;
          lanes.push(item.endTime);
        } else {
          lanes[laneIndex] = item.endTime;
        }

        const positionedItem = {
          ...item,
          lane: laneIndex,
          position: getJobPosition(item),
        };

        if (item.isPreview) {
          finalPreviewItem = positionedItem;
        } else {
          result.push(positionedItem);
        }
      });

      return {
        positionedJobs: result,
        previewItem: finalPreviewItem,
        totalLanes: Math.max(1, lanes.length),
      };
    }, [jobs, dragPreview, getJobPosition]);

    const fallback = technician.name
      ? technician.name.charAt(0).toUpperCase() +
        (technician.name.charAt(1) || "").toUpperCase()
      : "??";

    return (
      <div
        ref={rowRef}
        className="flex border-b hover:bg-brand-50 transition-colors min-w-max"
      >
        {/* Technician Info */}
        <div className="w-48 flex-shrink-0 border-r p-3 flex items-start gap-2 pt-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={technician.image || "/placeholder.svg"} />
            <AvatarFallback className="text-xs bg-brand-100 text-brand-700">
              {fallback}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate pt-1">
            {technician.name}
          </span>
        </div>

        {/* Timeline Grid */}
        <div
          ref={gridRef}
          className="flex flex-1 min-w-max relative overflow-hidden"
          style={{
            height: `${totalLanes * 80 + 10}px`,
          }}
        >
          {/* Time slot grid */}
          {timeSlots.map((slot, index) => (
            <TimeSlotCell
              key={index}
              technicianId={technician.id}
              timeSlot={slot}
              instanceId={instanceId}
              viewMode={viewMode}
            />
          ))}

          {/* Job Cards Overlay */}
          <div className="absolute inset-0 pointer-events-none ">
            {positionedJobs.map((job) => {
              return (
                <div
                  key={job.id}
                  className={cn(
                    "absolute h-[70px] !opacity-100",
                    isDragging ? "pointer-events-none" : "pointer-events-auto",
                  )}
                  style={{
                    left: job.position.left,
                    width: job.position.width,
                    top: `${job.lane * 80 + 10}px`,
                    display: job.position.display || "block",
                    opacity: 100,
                  }}
                >
                  <GanttJobCard job={job} technicianId={technician.id} />
                </div>
              );
            })}

            {previewItem && (
              <div
                className="absolute pointer-events-none h-[70px] 1opacity-100 z-30"
                style={{
                  left: previewItem.position.left,
                  width: previewItem.position.width,
                  top: `${previewItem.lane * 80 + 10}px`,
                  display: previewItem.position.display || "block",
                }}
              >
                <GanttJobCard job={previewItem} technicianId={technician.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

GanttTechnicianRow.displayName = "GanttTechnicianRow";

// Time slot cell component
const TimeSlotCell = memo(
  ({ technicianId, timeSlot, instanceId, viewMode }) => {
    const cellRef = useRef(null);

    useEffect(() => {
      if (!cellRef.current) return;

      return dropTargetForElements({
        element: cellRef.current,
        getData: () => ({ technicianId, timeSlot }),
        canDrop: ({ source }) => {
          return (
            source.data.instanceId === instanceId &&
            (source.data.type === "job-card" ||
              source.data.type === "table-job" ||
              source.data.type === "job-resize" ||
              source.data.type === "job-resize-start" ||
              source.data.type === "job-resize-end")
          );
        },
      });
    }, [technicianId, timeSlot, instanceId]);

    //for grid here put border-r
    return (
      <div
        ref={cellRef}
        className={cn(
          "flex-1 hover:bg-blue-50/30 transition-colors h-full",
          viewMode === "week" ? "min-w-[300px]" : "min-w-[100px]",
        )}
      />
    );
  },
);

TimeSlotCell.displayName = "TimeSlotCell";
