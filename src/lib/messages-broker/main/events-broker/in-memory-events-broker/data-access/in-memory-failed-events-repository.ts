import { FailedEvent, FailedEventsRepository } from './failed-events-repository';

class InMemoryFailedEventsRepository implements FailedEventsRepository {
    private readonly map = new Map<string, FailedEvent>();

    async save(data: FailedEvent): Promise<void> {
        this.map.set(data.id, data);
    }

    async findAllUnsuccessfullWithRetriesLessThanMax(): Promise<FailedEvent[]> {
        return Array.from(this.map.values()).filter(
            failed => !failed.processedSuccessfully && failed.retries < failed.handlerMaxRetries,
        );
    }
}

export { InMemoryFailedEventsRepository };
