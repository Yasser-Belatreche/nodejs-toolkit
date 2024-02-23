import { OutboxEvent } from './outbox-event';

export interface OutboxEventRepository {
    create(outboxEvent: OutboxEvent): Promise<void>;

    createBatch(outboxEvents: OutboxEvent[]): Promise<void>;

    update(outboxEvent: OutboxEvent): Promise<void>;

    ofId(id: string): Promise<OutboxEvent | null>;

    allToRetry(): Promise<OutboxEvent[]>;
}
