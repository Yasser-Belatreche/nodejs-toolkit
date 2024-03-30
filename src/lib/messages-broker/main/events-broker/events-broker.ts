import { GenerateUuid } from '@lib/primitives/generic/helpers/generate-uuid';
import { PrimitivesRecord } from '@lib/primitives/generic/types/primitives-record';
import { SessionCorrelationId } from '@lib/primitives/application-specific/session';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

export interface EventsBroker {
    publish<T extends Event<any>>(event: T, session: SessionCorrelationId): Promise<void>;

    shouldExplicitlyRetryFailedEvents(): boolean;

    retryFailedEvents(): Promise<void>;

    registerUniversalEventHandler(handler: UniversalEventHandler): Promise<void>;

    registerEventHandler<T extends Event<any>>(handler: EventHandler<T>): Promise<void>;

    clear(): Promise<void>;

    health(): Promise<EventsBrokerHealth>;
}

export interface EventsBrokerHealth {
    provider: string;
    status: 'up' | 'down';
    message?: string;
}

export abstract class Event<T extends Record<string, any>> {
    abstract readonly name: string;
    abstract readonly payload: T;

    readonly eventId: string;
    readonly occurredAt: Date;

    static From(state: Event<any>['state']): Event<any> {
        const event = new (Event as any)(state.eventId, state.occurredAt);

        event.eventId = state.eventId;
        event.occurredAt = new Date(state.occurredAt);
        event.payload = state.payload;
        event.name = state.name;

        return event;
    }

    protected constructor(eventId?: string, occurredAt?: Date) {
        this.occurredAt = occurredAt ?? new Date();
        this.eventId = eventId ?? GenerateUuid();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    get state() {
        return {
            eventId: this.eventId,
            occurredAt: this.occurredAt,
            name: this.name,
            payload: { ...this.payload },
        } satisfies PrimitivesRecord;
    }
}

export interface Config {
    retries?: number;
    disabled?: boolean;
}

export abstract class EventHandler<E extends Event<any>> {
    abstract eventName(): E['name'];

    abstract handle(event: E, session: SessionCorrelationId): Promise<void>;

    config(): Config {
        return {};
    }

    private readonly _id: string;

    protected constructor(component: string) {
        this._id = `[${component}] ${this.constructor.name}`;
    }

    id(): string {
        return this._id;
    }

    idEquals(id: string): boolean {
        return this._id === id;
    }
}

export abstract class UniversalEventHandler extends EventHandler<Event<any>> {
    eventName(): string {
        throw new DeveloperException(
            'WRONG_METHOD_CALL',
            'UniversalEventHandler should not have an event name',
        );
    }
}
