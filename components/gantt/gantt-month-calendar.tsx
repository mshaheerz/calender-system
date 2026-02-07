"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { useGanttContext } from "@/lib/gantt/gantt-context";
import ReactDOM from "react-dom";

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function GanttMonthCalendar({
  technicians,
  jobs,
  currentDate,
  onJobMove,
}: {
  technicians: any[];
  jobs: any[];
  currentDate: Date;
  onJobMove?: (config: any) => void;
}) {
  const [selectedTechId, setSelectedTechId] = useState(technicians[0]?.id);
  const { instanceId, isDragEnabled } = useGanttContext();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
  }, [startDate, endDate]);

  const selectedTechJobs = useMemo(() => {
    return jobs.filter((job) => job.technicianId === selectedTechId);
  }, [jobs, selectedTechId]);

  return (
    <div className="flex bg-background rounded-lg border border-border overflow-hidden h-fit min-h-[600px] shadow-sm">
      {/* Technicians Sidebar */}
      <div className="w-64 border-r border-border bg-muted/20 flex flex-col shrink-0">
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {technicians.map((tech) => (
              <button
                key={tech.id}
                onClick={() => setSelectedTechId(tech.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-md transition-all duration-200 text-left",
                  selectedTechId === tech.id
                    ? "bg-muted text-foreground shadow-sm border border-border"
                    : "hover:bg-muted/50 text-muted-foreground border border-transparent",
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 border border-grey-200">
                    <AvatarImage src={tech.image || "/placeholder.svg"} />
                    <AvatarFallback className="bg-brand-100 text-brand-700 font-bold text-xs">
                      {tech.name.charAt(0).toUpperCase()}
                      {tech.name.split(" ")[1]?.charAt(0).toUpperCase() || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm truncate">
                    {tech.name}
                  </span>
                  <span className="text-[10px] text-grey-500">Technician</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-background text-foreground">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-0">
          {calendarDays.map((day, idx) => {
            const dayJobs = selectedTechJobs.filter((job) =>
              isSameDay(new Date(job.startTime), day),
            );
            const isOutsideMonth = !isSameMonth(day, monthStart);

            return (
              <CalendarCell
                key={day.toString()}
                day={day}
                jobs={dayJobs}
                isOutsideMonth={isOutsideMonth}
                isLastInRow={idx % 7 === 6}
                technicianId={selectedTechId}
                instanceId={instanceId}
                isDragEnabled={isDragEnabled}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CalendarCell({
  day,
  jobs,
  isOutsideMonth,
  isLastInRow,
  technicianId,
  instanceId,
  isDragEnabled,
}: {
  day: Date;
  jobs: any[];
  isOutsideMonth: boolean;
  isLastInRow: boolean;
  technicianId: string;
  instanceId: any;
  isDragEnabled: boolean;
}) {
  const cellRef = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const element = cellRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ technicianId, timeSlot: day }),
      canDrop: ({ source }) =>
        isDragEnabled &&
        source.data.instanceId === instanceId &&
        (source.data.type === "job-card" || source.data.type === "table-job"),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [day, technicianId, instanceId, isDragEnabled]);

  return (
    <div
      ref={cellRef}
      className={cn(
        "border-r border-b border-border p-2 flex flex-col gap-1 min-h-[120px] transition-colors overflow-hidden",
        isOutsideMonth ? "bg-muted/10 opacity-60" : "bg-card",
        isLastInRow ? "border-r-0" : "",
        isDraggedOver && "bg-muted/50 ring-2 ring-inset ring-brand-500 z-10",
      )}
    >
      <div className="flex justify-end mb-1">
        <span
          className={cn(
            "text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full transition-colors",
            isOutsideMonth ? "text-muted-foreground/40" : "text-foreground",
            isSameDay(day, new Date())
              ? "bg-brand-600 dark:bg-brand-500 text-white shadow-sm"
              : "",
          )}
        >
          {format(day, "d")}
        </span>
      </div>

      <div className="flex-1 space-y-1 overflow-hidden">
        {jobs.slice(0, 4).map((job) => (
          <DraggableJobItem
            key={job.id}
            job={job}
            technicianId={technicianId}
            instanceId={instanceId}
            isDragEnabled={isDragEnabled}
          />
        ))}

        {jobs.length > 4 && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full text-[10px] font-bold text-brand-500 hover:text-brand-400 hover:bg-muted/50 py-1 rounded transition-colors border border-transparent hover:border-border shadow-sm mt-1">
                {jobs.length - 4} more
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 shadow-2xl border-border bg-popover overflow-hidden rounded-xl">
              <div className="bg-muted/30 p-3 border-b border-border">
                <p className="text-sm font-bold text-foreground">
                  {format(day, "EEEE, MMMM do")}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {jobs.length} Assigned Tasks
                </p>
              </div>
              <ScrollArea className="max-h-80">
                <div className="p-2 space-y-1">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border group"
                    >
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm",
                          job.status === "scheduled"
                            ? "bg-blue-500"
                            : job.status === "in_progress"
                              ? "bg-orange-500"
                              : job.status === "completed"
                                ? "bg-green-500"
                                : "bg-grey-400",
                        )}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate group-hover:text-brand-500 transition-colors">
                          {job.title}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-semibold text-muted-foreground">
                            {format(new Date(job.startTime), "h:mm a")}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span className="text-[9px] text-muted-foreground/60 truncate">
                            {job.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}

function DraggableJobItem({
  job,
  technicianId,
  instanceId,
  isDragEnabled,
}: {
  job: any;
  technicianId: string;
  instanceId: any;
  isDragEnabled: boolean;
}) {
  const itemRef = useRef(null);
  const { isDragging: globalIsDragging } = useGanttContext();
  const [isDragging, setIsDragging] = useState(false);
  const [previewState, setPreviewState] = useState<{
    container: HTMLElement;
  } | null>(null);

  useEffect(() => {
    const element = itemRef.current;
    if (!element || !isDragEnabled) return;

    return draggable({
      element,
      getInitialData: () => ({
        type: "job-card",
        jobId: job.id,
        technicianId,
        instanceId,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          render({ container }) {
            setPreviewState({ container });
            return () => setPreviewState(null);
          },
        });
      },
    });
  }, [job.id, technicianId, instanceId, isDragEnabled]);

  return (
    <>
      <div
        ref={itemRef}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded border border-transparent hover:border-border hover:bg-muted/30 cursor-grab active:cursor-grabbing transition-all group",
          isDragging && "opacity-30",
          globalIsDragging ? "pointer-events-none" : "pointer-events-auto",
          job.status === "scheduled"
            ? "bg-blue-500/10"
            : job.status === "in_progress"
              ? "bg-amber-500/10"
              : job.status === "completed"
                ? "bg-emerald-500/10"
                : "bg-muted",
        )}
      >
        <div
          className={cn(
            "h-2 w-2 rounded-full shrink-0 ring-1 ring-white shadow-xs",
            job.status === "scheduled"
              ? "bg-blue-500"
              : job.status === "in_progress"
                ? "bg-orange-500"
                : job.status === "completed"
                  ? "bg-green-500"
                  : "bg-grey-400",
          )}
        />
        <span className="text-[10px] text-muted-foreground truncate font-semibold group-hover:text-foreground transition-colors uppercase tracking-tight">
          {job.title}
        </span>
      </div>

      {previewState &&
        ReactDOM.createPortal(
          <div className="bg-background/95 backdrop-blur-sm p-2 border border-border rounded-lg shadow-xl flex items-center gap-2 min-w-[150px]">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                job.status === "scheduled"
                  ? "bg-blue-500"
                  : "bg-muted-foreground",
              )}
            />
            <span className="text-xs font-bold text-foreground truncate">
              {job.title}
            </span>
          </div>,
          previewState.container,
        )}
    </>
  );
}
