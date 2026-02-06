"use client";

import { useState, useRef, useEffect, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { disableNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview";
import { useGanttContext } from "./gantt-context";
import { MapPin } from "lucide-react";
import { format } from "date-fns";

const getStatusColor = (status, isDragging) => {
  const baseColors = {
    scheduled:
      "bg-blue-100 border-blue-100 hover:bg-blue-200",
    in_progress:
      "bg-orange-100 border-orange-100 hover:bg-orange-200",
    completed:
      "bg-green-100 border-green-100 hover:bg-green-200",
    cancelled:
      "bg-red-100 border-red-100 hover:bg-red-200",
    default:
      "bg-grey-100 border-grey-100 hover:bg-grey-200",
  };

  const draggingColors = {
    scheduled:
      "bg-blue-100 border-blue-100 ring-2 ring-blue-200 ring-offset-1 !opacity-100",
    in_progress:
      "bg-orange-100 border-orange-100 ring-2 ring-orange-200 ring-offset-1 !opacity-100",
    completed:
      "bg-green-100 border-green-100 ring-2 ring-green-200 ring-offset-1 !opacity-100",
    cancelled:
      "bg-red-100 border-red-100 ring-2 ring-red-200 ring-offset-1 !opacity-100",
    default:
      "bg-grey-100 border-grey-100 ring-2 ring-grey-200 ring-offset-1 !opacity-100",
  };

  const colors = isDragging ? draggingColors : baseColors;
  return colors[status] || colors.default;
};

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "scheduled":
      return "brand";
    case "in_progress":
      return "warning";
    case "completed":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "grey";
  }
};

const JobCardPrimitive = memo(function JobCardPrimitive({
  job,
  isDragging,
  cardRef,
  rightResizeRef,
  leftResizeRef,
}) {
  return (
    <div
      className={cn(
        "relative group h-full",
        !isDragging && "transition-all duration-200",
        isDragging && "!opacity-100 z-50", // Force container opacity
      )}
    >
      <Card
        ref={cardRef}
        className={cn(
          "h-full cursor-grab hover:shadow-md border-l-4 overflow-hidden text-[10px]",
          !isDragging && "transition-all duration-200",
          getStatusColor(job.status, isDragging),
        )}
      >
        <CardContent className="p-1 px-2 h-full flex flex-col justify-center">
          <div className="space-y-0.5">
            <p
              className={cn(
                "font-bold line-clamp-1 leading-tight",
                isDragging ? "text-grey-900" : "text-grey-900",
              )}
            >
              {job.title}
            </p>
            <div
              className={cn(
                "flex items-center gap-1",
                isDragging ? "text-grey-700" : "text-grey-700",
              )}
            >
              <span className="font-medium whitespace-nowrap">
                {format(job.startTime, "h:mm a")} -{" "}
                {format(job.endTime, "h:mm a")}
              </span>
            </div>

            {/* Expanded details only if height permits (optional/simple for now) */}
            {job.location && (
              <div
                className={cn(
                  "items-center gap-1 opacity-80 hidden sm:flex",
                  isDragging ? "text-grey-600" : "text-grey-600",
                )}
              >
                <MapPin className="h-2.5 w-2.5" />
                <span className="line-clamp-1">{job.location}</span>
              </div>
            )}

            <Badge
              variant={getStatusBadgeVariant(job.status)}
              className="text-[9px] px-1 py-0 h-4 mt-0.5"
            >
              {job.status.replace("_", " ")}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Left Resize Handle */}
      {leftResizeRef && (
        <div
          ref={leftResizeRef}
          className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
          title="Resize start time"
        >
          <div className="w-1.5 h-6 bg-white border border-gray-300 rounded-full shadow-sm" />
        </div>
      )}

      {/* Right Resize Handle */}
      {rightResizeRef && (
        <div
          ref={rightResizeRef}
          className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
          title="Resize end time"
        >
          <div className="w-1.5 h-6 bg-white border border-gray-300 rounded-full shadow-sm" />
        </div>
      )}
    </div>
  );
});

export const GanttJobCard = memo(({ job, technicianId }) => {
  const cardRef = useRef(null);
  const [state, setState] = useState({
    isDragging: false,
  });

  const { instanceId, registerJobCard } = useGanttContext();

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    return registerJobCard({
      jobId: job.id,
      entry: {
        element: element,
      },
    });
  }, [job.id, registerJobCard]);

  const leftResizeRef = useRef(null);
  const rightResizeRef = useRef(null);

  // Main Job Card Draggable
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    return draggable({
      element: element,
      getInitialData: ({ input }) => {
        const rect = element.getBoundingClientRect();
        return {
          type: "job-card",
          jobId: job.id,
          technicianId: technicianId,
          instanceId,
          grabOffset: input.clientX - rect.left,
        };
      },
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        disableNativeDragPreview({ nativeSetDragImage });
      },
      onDragStart: () => setState((prev) => ({ ...prev, isDragging: true })),
      onDrop: () => {
        setState({
          isDragging: false,
        });
      },
    });
  }, [instanceId, job.id, technicianId]);

  // Left Resize Draggable
  useEffect(() => {
    const element = leftResizeRef.current;
    if (!element) return;

    return draggable({
      element: element,
      getInitialData: () => ({
        type: "job-resize-start",
        jobId: job.id,
        technicianId: technicianId,
        instanceId,
      }),
      onDragStart: () => setState((prev) => ({ ...prev, isDragging: true })),
      onDrop: () => setState((prev) => ({ ...prev, isDragging: false })),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        disableNativeDragPreview({ nativeSetDragImage });
      },
    });
  }, [instanceId, job.id, technicianId]);

  // Right Resize Draggable
  useEffect(() => {
    const element = rightResizeRef.current;
    if (!element) return;

    return draggable({
      element: element,
      getInitialData: () => ({
        type: "job-resize-end",
        jobId: job.id,
        technicianId: technicianId,
        instanceId,
      }),
      onDragStart: () => setState((prev) => ({ ...prev, isDragging: true })),
      onDrop: () => setState((prev) => ({ ...prev, isDragging: false })),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        disableNativeDragPreview({ nativeSetDragImage });
      },
    });
  }, [instanceId, job.id, technicianId]);

  return (
    <>
      <JobCardPrimitive
        cardRef={cardRef}
        leftResizeRef={leftResizeRef}
        rightResizeRef={rightResizeRef}
        job={job}
        isDragging={state.isDragging || job.isPreview}
      />
    </>
  );
});

GanttJobCard.displayName = "GanttJobCard";
