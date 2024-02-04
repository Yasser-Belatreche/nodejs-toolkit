import { Rhythm, ScheduledJob } from '@lib/jobs-scheduler/main/jobs-scheduler';
import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

import { MessagesBroker } from '../messages-broker';

class RetryFailedEventsJob implements ScheduledJob {
    constructor(private readonly broker: MessagesBroker) {}

    async run(session: SessionCorrelationId): Promise<void> {
        await this.broker.retryFailedEvents();
    }

    rhythm(): Rhythm {
        return {
            frequency: 'custom',
            interval: 'every 15m',
        };
    }
}

export { RetryFailedEventsJob };
