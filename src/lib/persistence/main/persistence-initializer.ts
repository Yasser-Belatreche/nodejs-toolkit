import { JobsScheduler } from '../../jobs-scheduler/main/jobs-scheduler';

import { Persistence } from './persistence';
import { BackupScheduledJob } from './scheduled-jobs/backup-scheduled-job';

let IsInitialized = false;

const PersistenceInitializer = {
    async Init(scheduler: JobsScheduler, persistence: Persistence) {
        if (IsInitialized) return;

        await persistence.connect();

        if (persistence.shouldBackup()) {
            scheduler.register(new BackupScheduledJob(persistence));
        }

        IsInitialized = true;
    },
};

export { PersistenceInitializer };
