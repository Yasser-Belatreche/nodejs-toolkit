import { JobsScheduler } from '@lib/jobs-scheduler/main/jobs-scheduler';
import { MessagesBroker } from '@lib/messages-broker/main/messages-broker';

import { RestClient } from './core/domain/rest-client';
import { WebhookRepository } from './core/domain/webhook-repository';
import { OutboxEventRepository } from './core/domain/outbox-event-repository';

import { AllEventsHandler } from './core/event-handlers/all-events-handler';

import { RetryOutboxEventsScheduledJob } from './core/scheduled-jobs/retry-outbox-events-scheduled-job';

let IsInitialized = false;

const WebhooksManagerInitializer = {
    async Init(
        broker: MessagesBroker,
        scheduler: JobsScheduler,
        restClient: RestClient,
        webhookRepository: WebhookRepository,
        outboxEventRepository: OutboxEventRepository,
    ): Promise<void> {
        if (IsInitialized) return;

        await broker.registerUniversalEventHandler(
            new AllEventsHandler(restClient, webhookRepository, outboxEventRepository),
        );
        scheduler.register(new RetryOutboxEventsScheduledJob(restClient, outboxEventRepository));

        IsInitialized = true;
    },
};

export { WebhooksManagerInitializer };
