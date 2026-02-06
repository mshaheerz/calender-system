"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
import { useGanttContext } from "./gantt-context";
import { GanttTechnicianRow } from "./gantt-technician-row";
import { GanttMonthCalendar } from "./gantt-month-calendar";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import invariant from "tiny-invariant";
import { Shell } from "@/components/shell";
import { cn } from "@/lib/utils";

// Static data for demonstration
const MOCK_TECHNICIANS = [
  { id: "1", name: "Shritha Kishor", image: null },
  { id: "2", name: "Baijwan Paraker", image: null },
  { id: "3", name: "Aahva Bansal", image: null },
  { id: "4", name: "Madhura Chad", image: null },
  { id: "5", name: "Malaimagai RS", image: null },
  { id: "6", name: "Aapt Nandan", image: null },
  { id: "7", name: "Benoy Kumari", image: null },
  { id: "8", name: "Ravi Kiran", image: null },
];

const MOCK_JOBS = [
  {
    id: "job-1",
    technicianId: "1",
    title: "Scheduled Service Visit",
    location: "Chennai",
    startTime: addHours(startOfDay(new Date()), 10),
    endTime: addHours(startOfDay(new Date()), 12),
    status: "scheduled",
  },
  {
    id: "job-1-overlap",
    technicianId: "1",
    title: "Emergency Repair (Overlap)",
    location: "Chennai",
    startTime: addHours(startOfDay(new Date()), 11),
    endTime: addHours(startOfDay(new Date()), 13),
    status: "scheduled",
  },
  {
    id: "job-2",
    technicianId: "2",
    title: "Work Order Assignment",
    location: "Erode",
    startTime: addHours(startOfDay(new Date()), 11),
    endTime: addHours(startOfDay(new Date()), 13),
    status: "in_progress",
  },
  {
    id: "job-3",
    technicianId: "3",
    title: "On-Site Repair Job",
    location: "Chennai",
    startTime: addHours(startOfDay(new Date()), 14),
    endTime: addHours(startOfDay(new Date()), 16),
    status: "scheduled",
  },
  // Add another overlap for Tech 1 to test row expansion
  {
    id: "job-1-overlap-2",
    technicianId: "1",
    title: "Late Inspection",
    location: "Chennai",
    startTime: addHours(startOfDay(new Date()), 11, 30),
    endTime: addHours(startOfDay(new Date()), 14),
    status: "scheduled",
  },
];

export default function DispatchGanttTimeline({
  viewMode,
  currentDate,
  search,
}) {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [dragOverData, setDragOverData] = useState(null);
  const timelineScrollRef = useRef(null);

  // Use context from parent instead of creating new one
  const { instanceId } = useGanttContext();

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

  const getTimeSlotLabel = (slot) => {
    if (viewMode === "day") {
      return format(slot, "h a");
    } else if (viewMode === "week") {
      return format(slot, "EEE d");
    } else if (viewMode === "month") {
      return format(slot, "MMM d");
    }
    return "";
  };

  // Filter technicians based on search
  const filteredTechnicians = useMemo(() => {
    if (!search) return MOCK_TECHNICIANS;
    return MOCK_TECHNICIANS.filter((tech) =>
      tech.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  // Get jobs for a specific technician
  const getJobsForTechnician = useCallback(
    (technicianId) => {
      return jobs.filter((job) => job.technicianId === technicianId);
    },
    [jobs],
  );

  // Handle job move
  const handleJobMove = useCallback(
    ({ jobId, toTechnicianId, newStartTime }) => {
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
    },
    [],
  );

  const calculatePreciseTime = useCallback(
    ({ location, dropTarget, timeSlotTarget, source }) => {
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
  const { setIsDragging } = useGanttContext();

  useEffect(() => {
    return combine(
      monitorForElements({
        canMonitor({ source }) {
          return source.data.instanceId === instanceId;
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
            // Find targets
            const gridTarget = location.current.dropTargets.find(
              (target) => target.data.isGrid === true,
            );
            const timeSlotTarget = location.current.dropTargets.find(
              (target) => target.data.timeSlot !== undefined,
            );

            // Use gridTarget by preference for calculation, fallback to anything found
            const dropTarget = gridTarget || timeSlotTarget;

            if (dropTarget) {
              // Always use grid calculation if we have a gridTarget, it's more stable
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

              if (
                source.data.type === "job-card" ||
                source.data.type === "job-resize" ||
                source.data.type === "job-resize-start" ||
                source.data.type === "job-resize-end"
              ) {
                const job = jobs.find((j) => j.id === source.data.jobId);
                if (job) {
                  if (
                    source.data.type === "job-resize" ||
                    source.data.type === "job-resize-end"
                  ) {
                    startTime = job.startTime;
                    duration = Math.max(
                      15 * 60 * 1000,
                      finalStartTime.getTime() - job.startTime.getTime(),
                    );
                  } else if (source.data.type === "job-resize-start") {
                    const newDuration =
                      job.endTime.getTime() - finalStartTime.getTime();
                    if (newDuration >= 15 * 60 * 1000) {
                      startTime = finalStartTime;
                      duration = newDuration;
                    } else {
                      // Prevent resizing past minimum duration
                      startTime = addMinutes(job.endTime, -15);
                      duration = 15 * 60 * 1000;
                    }
                  } else {
                    duration = job.endTime.getTime() - job.startTime.getTime();
                  }
                }
              }

              setDragOverData({
                technicianId: dropTarget.data.technicianId,
                startTime,
                duration,
                type: source.data.type,
                jobId: source.data.jobId,
                job:
                  source.data.job ||
                  jobs.find((j) => j.id === source.data.jobId),
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

          const isJobAction =
            source.data.type === "job-card" ||
            source.data.type === "table-job" ||
            source.data.type === "job-resize" ||
            source.data.type === "job-resize-start" ||
            source.data.type === "job-resize-end";

          if (isJobAction) {
            const timeSlotTarget = location.current.dropTargets.find(
              (target) => target.data.timeSlot !== undefined,
            );
            const gridTarget = location.current.dropTargets.find(
              (target) => target.data.isGrid === true,
            );

            const dropTarget =
              gridTarget || timeSlotTarget || location.current.dropTargets[0];
            const toTechnicianId = dropTarget.data.technicianId;

            // Prioritize gridTarget for calculation
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

            if (source.data.type === "table-job") {
              // Creating new job from table
              const tableJob = source.data.job;
              const newJob = {
                id: tableJob.id,
                technicianId: toTechnicianId,
                title: tableJob.title,
                location: tableJob.location,
                startTime: finalStartTime,
                endTime: addHours(finalStartTime, 2), // Default 2 hour duration
                status: "scheduled",
              };
              setJobs((prevJobs) => [...prevJobs, newJob]);
            } else if (source.data.type === "job-card") {
              const jobId = source.data.jobId;
              invariant(typeof jobId === "string");
              // Moving existing job
              handleJobMove({
                jobId,
                toTechnicianId,
                newStartTime: finalStartTime,
              });
            } else if (
              source.data.type === "job-resize" ||
              source.data.type === "job-resize-end"
            ) {
              const jobId = source.data.jobId;
              invariant(typeof jobId === "string");
              // Resizing end time
              setJobs((prevJobs) =>
                prevJobs.map((j) => {
                  if (j.id === jobId) {
                    const newEndTime =
                      finalStartTime > j.startTime
                        ? finalStartTime
                        : addMinutes(j.startTime, 15);
                    return { ...j, endTime: newEndTime };
                  }
                  return j;
                }),
              );
            } else if (source.data.type === "job-resize-start") {
              const jobId = source.data.jobId;
              invariant(typeof jobId === "string");
              // Resizing start time
              setJobs((prevJobs) =>
                prevJobs.map((j) => {
                  if (j.id === jobId) {
                    const newStartTime =
                      finalStartTime < j.endTime
                        ? finalStartTime
                        : addMinutes(j.endTime, -15);
                    return { ...j, startTime: newStartTime };
                  }
                  return j;
                }),
              );
            }
          }
        },
      }),
    );
  }, [instanceId, handleJobMove, calculatePreciseTime, jobs]);

  return (
    <Card className="border-b-0 border-x-0 border-t shadow-sm rounded-none overflow-hidden">
      {/* <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">
          Dispatcher / Field Service Schedule
        </h3>
      </CardHeader> */}
      <CardContent className="p-0 border-none shadow-none">
        {viewMode === "month" ? (
          <GanttMonthCalendar
            technicians={filteredTechnicians}
            jobs={jobs}
            currentDate={currentDate}
            onJobMove={handleJobMove}
          />
        ) : (
          <Shell variant={"normal"}>
            <div
              ref={timelineScrollRef}
              className="overflow-x-auto overflow-y-auto  custom-scrollbar"
              style={{ maxHeight: "50vh" }}
            >
              {/* Time Header */}
              <div className="flex border-b sticky top-0 bg-white z-20 min-w-max">
                <div className="w-48 flex-shrink-0 border-r p-3 font-semibold bg-brand-25">
                  Technician
                </div>
                <div className="flex flex-1 min-w-max relative">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex-1 p-2 text-center text-sm font-medium bg-brand-25",
                        viewMode === "week" ? "min-w-[300px]" : "min-w-[100px]",
                      )}
                    >
                      {getTimeSlotLabel(slot)}
                    </div>
                  ))}
                  {/* Floating Time Indicator - Header Part */}
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
                {filteredTechnicians.map((technician) => (
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
          </Shell>
        )}
      </CardContent>
    </Card>
  );
}
