import { RestClient } from '../../main/core/domain/rest-client';
import { InMemoryOutboxEventRepository } from '../../main/infra/data-access/in-memory-outbox-event-repository';
import { InMemoryWebhookRepository } from '../../main/infra/data-access/in-memory-webhook-repository';
import { WebhooksManagerFacade } from '../../main/webhooks-manager-facade';
import { FakeRestClient } from './fakes/fake-rest-client';

interface Dependencies {
    restClient: RestClient;
}

const aWebhooksManagerFacade = (depends?: Partial<Dependencies>): WebhooksManagerFacade => {
    return new WebhooksManagerFacade(
        depends?.restClient ?? new FakeRestClient(),
        new InMemoryWebhookRepository(),
        new InMemoryOutboxEventRepository(),
    );
};

export { aWebhooksManagerFacade };
