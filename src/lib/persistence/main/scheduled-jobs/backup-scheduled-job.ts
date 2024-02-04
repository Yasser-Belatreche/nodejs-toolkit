import { Log } from '../../../logger/main/log-decorator';
import { Rhythm, ScheduledJob } from '../../../jobs-scheduler/main/jobs-scheduler';

import { GetScheduledJobLogMessage } from '../../../primitives/application-specific/consistency/log-messages';

import { Persistence } from '../persistence';

class BackupScheduledJob implements ScheduledJob {
    constructor(private readonly persistence: Persistence) {}

    @Log(GetScheduledJobLogMessage('persistence', BackupScheduledJob.name, 'generating the backup'))
    async run(): Promise<void> {
        await this.persistence.backup();
    }

    rhythm(): Rhythm {
        return {
            frequency: 'everyWeek',
            firstExecutionTime: '01:00',
            firstExecutionDay: 'friday',
        };
    }
}

export { BackupScheduledJob };
