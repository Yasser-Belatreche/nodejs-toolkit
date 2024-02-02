import { JobsScheduler } from './jobs-scheduler';
import { InMemoryJobsScheduler } from './in-memory-jobs-scheduler';

const JobsSchedulerFactory = {
    anInstance(): JobsScheduler {
        return InMemoryJobsScheduler.Instance({ disabled: false });
    },
};

export { JobsSchedulerFactory };
