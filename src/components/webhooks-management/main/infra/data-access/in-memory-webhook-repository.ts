import { Webhook } from '../../core/domain/webhook';
import { WebhookRepository } from '../../core/domain/webhook-repository';

class InMemoryWebhookRepository implements WebhookRepository {
    private readonly map = new Map<string, Webhook>();

    async create(webhook: Webhook): Promise<void> {
        this.map.set(webhook.id, webhook);
    }

    async update(webhook: Webhook): Promise<void> {
        this.map.set(webhook.id, webhook);
    }

    async delete(webhook: Webhook): Promise<void> {
        this.map.delete(webhook.id);
    }

    async ofId(id: string): Promise<Webhook | null> {
        const webhook = this.map.get(id);

        if (!webhook) return null;

        return webhook;
    }
}

export { InMemoryWebhookRepository };
