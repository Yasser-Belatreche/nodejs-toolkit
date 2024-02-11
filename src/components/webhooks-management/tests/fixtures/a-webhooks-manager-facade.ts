import { InMemoryWebhookRepository } from '../../main/infra/data-access/in-memory-webhook-repository';
import { WebhooksManagerFacade } from '../../main/webhooks-manager-facade';

const aWebhooksManagerFacade = (): WebhooksManagerFacade => {
    return new WebhooksManagerFacade(new InMemoryWebhookRepository());
};

export { aWebhooksManagerFacade };
