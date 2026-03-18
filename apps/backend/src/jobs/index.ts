// Background jobs module
// Implementation deferred until Sprint 7

export interface JobDefinition {
  name: string;
  handler: () => Promise<void>;
  schedule: string; // cron expression
}

export interface JobScheduler {
  register(job: JobDefinition): void;
  start(): void;
  stop(): void;
  runNow(name: string): Promise<void>;
}

export const scheduledJobs: JobDefinition[] = [
  // Sprint 7: Add token refresh job
  // Sprint 7: Add cooldown recovery check job
  // Sprint 7: Add runtime sync job
];
