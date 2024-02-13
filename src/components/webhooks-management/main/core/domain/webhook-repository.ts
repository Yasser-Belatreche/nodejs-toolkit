import { Webhook } from './webhook';

export interface WebhookRepository {
    create(webhook: Webhook): Promise<void>;

    update(webhook: Webhook): Promise<void>;

    delete(webhook: Webhook): Promise<void>;

    ofId(id: string): Promise<Webhook | null>;

    ofEvent(event: string): Promise<Webhook[]>;
}
