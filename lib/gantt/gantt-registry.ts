import invariant from "tiny-invariant";

/**
 * Registry for tracking job cards and technician rows
 */
export function createGanttRegistry() {
  const jobCards = new Map();
  const technicianRows = new Map();

  function registerJobCard({ jobId, entry }) {
    jobCards.set(jobId, entry);
    return function cleanup() {
      jobCards.delete(jobId);
    };
  }

  function registerTechnicianRow({ technicianId, entry }) {
    technicianRows.set(technicianId, entry);
    return function cleanup() {
      technicianRows.delete(technicianId);
    };
  }

  function getJobCard(jobId) {
    const entry = jobCards.get(jobId);
    invariant(entry, `Job card with id ${jobId} not found in registry`);
    return entry;
  }

  function getTechnicianRow(technicianId) {
    const entry = technicianRows.get(technicianId);
    invariant(
      entry,
      `Technician row with id ${technicianId} not found in registry`,
    );
    return entry;
  }

  return {
    registerJobCard,
    registerTechnicianRow,
    getJobCard,
    getTechnicianRow,
  };
}
