import { Rhythm, ScheduledJob } from '../../../jobs-scheduler/main/jobs-scheduler';

import { Logger } from '../logger';

class ClearLogsScheduledJob implements ScheduledJob {
    constructor(private readonly logger: Logger) {}

    async run(): Promise<void> {
        await this.logger.clear({ saveOld: true });
    }

    rhythm(): Rhythm {
        return {
            frequency: 'custom',
            interval: `every 24h`,
            firstExecutionTime: '01:00',
        };
    }
}

export { ClearLogsScheduledJob };
