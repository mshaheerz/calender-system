"use client";

import { createContext, useContext } from "react";
import invariant from "tiny-invariant";

export interface GanttContextValue {
  instanceId: Symbol;
  registerJobCard: (config: any) => () => void;
  registerTechnicianRow: (config: any) => () => void;
  viewMode: "day" | "week" | "month";
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  isDragEnabled: boolean;
  setIsDragEnabled: (enabled: boolean) => void;
}

export const GanttContext = createContext<GanttContextValue | null>(null);

export function useGanttContext(): GanttContextValue {
  const value = useContext(GanttContext);
  invariant(
    value,
    "useGanttContext must be used within a GanttProvider (GanttContext.Provider)",
  );
  return value;
}
