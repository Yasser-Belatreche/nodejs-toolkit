import { WebhooksManager } from './webhooks-manager';
import { WebhooksManagerFacade } from './webhooks-manager-facade';
import { WebhooksManagerInitializer } from './webhooks-manager-initializer';
import { WebhooksManagerAuthorizationAndLoggerDecorator } from './webhooks-manager-authorization-and-logger-decorator';

import { RestClient } from './core/domain/rest-client';
import { WebhookRepository } from './core/domain/webhook-repository';
import { OutboxEventRepository } from './core/domain/outbox-event-repository';

import { FetchRestClient } from './infra/fetch-rest-client';
import { InMemoryWebhookRepository } from './infra/in-memory-webhook-repository';
import { InMemoryOutboxEventRepository } from './infra/in-memory-outbox-event-repository';

import { JobsScheduler } from '@lib/jobs-scheduler/main/jobs-scheduler';
import { MessagesBroker } from '@lib/messages-broker/main/messages-broker';

let instance: WebhooksManager | undefined;

const restClient: RestClient = new FetchRestClient();
const webhookRepository: WebhookRepository = new InMemoryWebhookRepository();
const outboxEventRepository: OutboxEventRepository = new InMemoryOutboxEventRepository();

const getInstance = (): WebhooksManager => {
    if (instance) {
        return instance;
    }

    instance = new WebhooksManagerAuthorizationAndLoggerDecorator(
        new WebhooksManagerFacade(restClient, webhookRepository, outboxEventRepository),
    );

    return instance;
};

const WebhooksManagerFactory = {
    async Setup(broker: MessagesBroker, scheduler: JobsScheduler): Promise<void> {
        await WebhooksManagerInitializer.Init(
            broker,
            scheduler,
            restClient,
            webhookRepository,
            outboxEventRepository,
        );
    },

    anInstance(): WebhooksManager {
        return getInstance();
    },
};

export { WebhooksManagerFactory };
