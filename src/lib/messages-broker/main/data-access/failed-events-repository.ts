import { Event } from '../messages-broker';

export interface FailedEvent {
    readonly id: string;

    readonly event: Event<any>;
    readonly handlerId: string;
    readonly handlerMaxRetries: number;
    readonly sessionCorrelationId: string;

    retries: number;
    lastError: Error;
    lastProcessingTryDate: Date;
    processedSuccessfully: boolean;
}

export interface FailedEventsRepository {
    save(data: FailedEvent): Promise<void>;

    findUnsuccessfullEventsWithRetriesLessThanMax(): Promise<FailedEvent[]>;
}
