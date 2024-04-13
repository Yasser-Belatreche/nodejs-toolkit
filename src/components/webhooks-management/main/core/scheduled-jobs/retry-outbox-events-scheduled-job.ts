import { Log } from '@lib/logger/main/log-decorator';
import { Rhythm, ScheduledJob } from '@lib/jobs-scheduler/main/jobs-scheduler';
import { SessionCorrelationId } from '@lib/primitives/application-specific/session';
import { GetScheduledJobLogMessage } from '@lib/primitives/application-specific/consistency/log-messages';

import { RestClient } from '../domain/rest-client';
import { RetryOutboxEvent } from '../domain/send-webhook-event';
import { OutboxEventRepository } from '../domain/outbox-event-repository';

class RetryOutboxEventsScheduledJob implements ScheduledJob {
    constructor(
        private readonly restClient: RestClient,
        private readonly outboxEventRepository: OutboxEventRepository,
    ) {}

    @Log(
        GetScheduledJobLogMessage(
            'webhooks manager',
            RetryOutboxEventsScheduledJob.name,
            'Retrying outbox events scheduled job',
        ),
    )
    async run(session: SessionCorrelationId): Promise<void> {
        const events = await this.outboxEventRepository.allToRetry();

        for (const event of events) {
            await RetryOutboxEvent(event, this.restClient, this.outboxEventRepository);
        }
    }

    rhythm(): Rhythm {
        return { frequency: 'custom', interval: 'every 5m' };
    }

    config(): { readonly retry: number } {
        return { retry: 0 };
    }
}

export { RetryOutboxEventsScheduledJob };
