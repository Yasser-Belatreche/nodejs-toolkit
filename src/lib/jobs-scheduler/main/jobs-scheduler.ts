import { Day } from '@lib/primitives/generic/types/day';
import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

export interface JobsScheduler {
    register(job: ScheduledJob): void;

    clearJobs(): void;
}

export interface ScheduledJob {
    run(session: SessionCorrelationId): Promise<void>;

    rhythm(): Rhythm;

    config?(): { readonly retry: number };
}

export type Rhythm = FirstExecutionTime & Frequency;

interface FirstExecutionTime {
    firstExecutionTime?: `${number}:${number}`;
    firstExecutionDay?: Day;
}

type Frequency =
    | {
          frequency: 'everyMinute' | 'everyHour' | 'everyDay' | 'everyWeek';
      }
    | {
          frequency: 'custom';
          interval:
              | `every ${number}s`
              | `every ${number}m`
              | `every ${number}h`
              | `every ${number}h ${number}m`
              | `every ${number}h ${number}m ${number}s`;
      };
