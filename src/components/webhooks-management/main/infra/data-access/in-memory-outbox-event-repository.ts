import { CanRetryOutboxEvent, OutboxEvent } from '../../core/domain/outbox-event';
import { OutboxEventRepository } from '../../core/domain/outbox-event-repository';

class InMemoryOutboxEventRepository implements OutboxEventRepository {
    private readonly map = new Map<string, OutboxEvent>();

    async create(outboxEvent: OutboxEvent): Promise<void> {
        this.map.set(outboxEvent.id, outboxEvent);
    }

    async createBatch(outboxEvents: OutboxEvent[]): Promise<void> {
        outboxEvents.forEach(event => this.map.set(event.id, event));
    }

    async update(outboxEvent: OutboxEvent): Promise<void> {
        this.map.set(outboxEvent.id, outboxEvent);
    }

    async ofId(id: string): Promise<OutboxEvent | null> {
        const outboxEvent = this.map.get(id);

        if (!outboxEvent) return null;

        return outboxEvent;
    }

    async allToRetry(): Promise<OutboxEvent[]> {
        return Array.from(this.map.values()).filter(event => CanRetryOutboxEvent(event));
    }
}

export { InMemoryOutboxEventRepository };
