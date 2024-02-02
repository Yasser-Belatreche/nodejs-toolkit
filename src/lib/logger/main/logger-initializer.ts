import { JobsScheduler } from '../../jobs-scheduler/main/jobs-scheduler';

import { Logger } from './logger';
import { ClearLogsScheduledJob } from './scheduled-jobs/clear-logs-scheduled-job';

let IsInitialized = false;

const LoggerInitializer = {
    Init(scheduler: JobsScheduler, logger: Logger) {
        if (IsInitialized) return;

        scheduler.register(new ClearLogsScheduledJob(logger));

        IsInitialized = true;
    },
};

export { LoggerInitializer };
