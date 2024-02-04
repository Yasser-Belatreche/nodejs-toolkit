import { JobsScheduler } from '@lib/jobs-scheduler/main/jobs-scheduler';
import { MessagesBroker } from './messages-broker';

import { RetryFailedEventsJob } from './scheduled-jobs/retry-failed-events-job';

let IsInitialized = false;

const MessagesBrokerInitializer = {
    Init(scheduler: JobsScheduler, broker: MessagesBroker) {
        if (IsInitialized) return;

        scheduler.register(new RetryFailedEventsJob(broker));

        IsInitialized = true;
    },
};

export { MessagesBrokerInitializer };
