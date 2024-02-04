import { JobsScheduler } from '@lib/jobs-scheduler/main/jobs-scheduler';
import { MessagesBroker } from './messages-broker';

import { RetryFailedEventsScheduledJob } from './scheduled-jobs/retry-failed-events-scheduled-job';

let IsInitialized = false;

const MessagesBrokerInitializer = {
    Init(scheduler: JobsScheduler, broker: MessagesBroker) {
        if (IsInitialized) return;

        scheduler.register(new RetryFailedEventsScheduledJob(broker));

        IsInitialized = true;
    },
};

export { MessagesBrokerInitializer };
