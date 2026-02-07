"use client";

import { useState, useRef, useEffect, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { disableNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview";
import { useGanttContext } from "@/lib/gantt/gantt-context";
import { MapPin, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

const getStatusColor = (status: string, isDragging: boolean) => {
  const baseColors: Record<string, string> = {
    scheduled:
      "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60",
    in_progress:
      "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60",
    completed:
      "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60",
    cancelled:
      "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60",
    default:
      "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60",
  };

  const draggingColors: Record<string, string> = {
    scheduled:
      "bg-blue-100 dark:bg-blue-900 border-blue-500 ring-2 ring-blue-400 dark:ring-blue-600 !opacity-100 scale-105 shadow-xl text-blue-900 dark:text-blue-100",
    in_progress:
      "bg-amber-100 dark:bg-amber-900 border-amber-500 ring-2 ring-amber-400 dark:ring-amber-600 !opacity-100 scale-105 shadow-xl text-amber-900 dark:text-amber-100",
    completed:
      "bg-emerald-100 dark:bg-emerald-900 border-emerald-500 ring-2 ring-emerald-400 dark:ring-emerald-600 !opacity-100 scale-105 shadow-xl text-emerald-900 dark:text-emerald-100",
    cancelled:
      "bg-rose-100 dark:bg-rose-900 border-rose-500 ring-2 ring-rose-400 dark:ring-rose-600 !opacity-100 scale-105 shadow-xl text-rose-900 dark:text-rose-100",
    default:
      "bg-slate-100 dark:bg-slate-800 border-slate-500 ring-2 ring-slate-400 dark:ring-slate-600 !opacity-100 scale-105 shadow-xl text-slate-900 dark:text-slate-100",
  };

  const colors = isDragging ? draggingColors : baseColors;
  return colors[status] || colors.default;
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "scheduled":
      return "brand";
    case "in_progress":
      return "warning";
    case "completed":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

const JobCardPrimitive = memo(function JobCardPrimitive({
  job,
  isDragging,
  cardRef,
  rightResizeRef,
  leftResizeRef,
}: any) {
  return (
    <div
      className={cn(
        "relative group h-full select-none",
        !isDragging && "transition-all duration-200",
        isDragging && "!opacity-100 z-50",
      )}
    >
      <Card
        ref={cardRef}
        className={cn(
          "h-full cursor-grab active:cursor-grabbing hover:shadow-lg border-l-4 overflow-hidden text-[10px]",
          !isDragging && "transition-all duration-200",
          getStatusColor(job.status, isDragging),
        )}
      >
        <CardContent className="p-2 px-3 h-full flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-start gap-2">
              <p className="font-bold line-clamp-1 leading-none text-[11px]">
                {job.title}
              </p>
              {job.priority === "high" && (
                <div
                  className="h-2 w-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0"
                  title="High Priority"
                />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-[9px]">
                <Clock className="h-2.5 w-2.5" />
                <span className="whitespace-nowrap">
                  {format(job.startTime, "h:mm a")} –{" "}
                  {format(job.endTime, "h:mm a")}
                </span>
              </div>

              {job.location && (
                <div className="items-center gap-1 flex text-muted-foreground font-medium">
                  <MapPin className="h-2.5 w-2.5" />
                  <span className="line-clamp-1 text-[8px]">
                    {job.location}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-1">
            <Badge
              variant={getStatusBadgeVariant(job.status) as any}
              className="text-[7px] px-1.5 py-0 h-4 font-bold"
            >
              {job.status.replace("_", " ")}
            </Badge>

            {job.cost !== undefined && (
              <div className="flex items-center gap-0.5 text-foreground font-bold text-[9px]">
                <DollarSign className="h-2.5 w-2.5 text-emerald-600" />
                <span>
                  {currencyFormatter.format(job.cost).replace("$", "")}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Left Resize Handle */}
      {leftResizeRef && (
        <div
          ref={leftResizeRef}
          className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-start group-hover:opacity-100 opacity-0 transition-opacity z-20 pointer-events-auto"
          title="Resize Start"
        >
          <div className="w-1 h-1/2 bg-foreground/30 border border-border rounded-full shadow-sm ml-0.5" />
        </div>
      )}

      {/* Right Resize Handle */}
      {rightResizeRef && (
        <div
          ref={rightResizeRef}
          className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-end group-hover:opacity-100 opacity-0 transition-opacity z-20 pointer-events-auto"
          title="Resize End"
        >
          <div className="w-1 h-1/2 bg-foreground/30 border border-border rounded-full shadow-sm mr-0.5" />
        </div>
      )}
    </div>
  );
});

export const GanttJobCard = memo(({ job, technicianId }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({
    isDragging: false,
  });

  const { instanceId, registerJobCard, isDragEnabled } = useGanttContext();

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

  const leftResizeRef = useRef<HTMLDivElement>(null);
  const rightResizeRef = useRef<HTMLDivElement>(null);

  // Main Job Card Draggable
  useEffect(() => {
    const element = cardRef.current;
    if (!element || !isDragEnabled) return;

    return draggable({
      element: element,
      getInitialData: ({ input }) => {
        const rect = element.getBoundingClientRect();
        return {
          type: "job-card",
          jobId: job.id,
          technicianId: technicianId,
          instanceId,
          job: job,
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
  }, [instanceId, job.id, job, technicianId, isDragEnabled]);

  // Left Resize Draggable
  useEffect(() => {
    const element = leftResizeRef.current;
    if (!element || !isDragEnabled) return;

    return draggable({
      element: element,
      getInitialData: () => ({
        type: "job-resize-start",
        jobId: job.id,
        technicianId: technicianId,
        instanceId,
        job: job,
      }),
      onDragStart: () => setState((prev) => ({ ...prev, isDragging: true })),
      onDrop: () => setState((prev) => ({ ...prev, isDragging: false })),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        disableNativeDragPreview({ nativeSetDragImage });
      },
    });
  }, [instanceId, job.id, job, technicianId, isDragEnabled]);

  // Right Resize Draggable
  useEffect(() => {
    const element = rightResizeRef.current;
    if (!element || !isDragEnabled) return;

    return draggable({
      element: element,
      getInitialData: () => ({
        type: "job-resize-end",
        jobId: job.id,
        technicianId: technicianId,
        instanceId,
        job: job,
      }),
      onDragStart: () => setState((prev) => ({ ...prev, isDragging: true })),
      onDrop: () => setState((prev) => ({ ...prev, isDragging: false })),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        disableNativeDragPreview({ nativeSetDragImage });
      },
    });
  }, [instanceId, job.id, job, technicianId, isDragEnabled]);

  return (
    <JobCardPrimitive
      cardRef={cardRef}
      leftResizeRef={leftResizeRef}
      rightResizeRef={rightResizeRef}
      job={job}
      isDragging={state.isDragging || !!job.isPreview}
    />
  );
});

GanttJobCard.displayName = "GanttJobCard";
