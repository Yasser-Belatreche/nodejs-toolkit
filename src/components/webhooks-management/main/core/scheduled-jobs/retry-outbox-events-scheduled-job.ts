import { Rhythm, ScheduledJob } from '@lib/jobs-scheduler/main/jobs-scheduler';
import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

import { RestClient } from '../domain/rest-client';
import { OutboxEventRepository } from '../domain/outbox-event-repository';
import { RetryOutboxEvent } from '../domain/send-webhook-event';
import { WebhookRepository } from '../domain/webhook-repository';

class RetryOutboxEventsScheduledJob implements ScheduledJob {
    constructor(
        private readonly restClient: RestClient,
        private readonly webhookRespository: WebhookRepository,
        private readonly outboxEventRespoitory: OutboxEventRepository,
    ) {}

    async run(session: SessionCorrelationId): Promise<void> {
        const events = await this.outboxEventRespoitory.allToRetry();

        for (const event of events) {
            await RetryOutboxEvent(event, this.restClient, this.outboxEventRespoitory);
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
