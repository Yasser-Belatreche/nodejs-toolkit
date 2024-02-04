import * as crypto from 'crypto';

import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

export interface MessagesBroker {
    publish<T extends Event<any>>(event: T, session: SessionCorrelationId): Promise<void>;

    retryFailedEvents(): Promise<void>;

    registerUniversalEventHandler(handler: UniversalEventHandler): void;

    registerEventHandler<T extends Event<any>>(handler: EventHandler<T>): void;

    ask<Q extends keyof RegisteredAnswers>(
        question: Q,
        params: RegisteredAnswers[Q]['takes'],
        session: SessionCorrelationId,
    ): Promise<RegisteredAnswers[Q]['returns']>;

    registerAnswer<Q extends keyof RegisteredAnswers>(answer: Answer<Q>): void;

    clear(): void;
}

export abstract class Event<T> {
    abstract readonly name: string;
    abstract readonly payload: T;

    readonly eventId: string;
    readonly occurredAt: Date;

    protected constructor(eventId?: string, occurredAt?: Date) {
        this.occurredAt = occurredAt ?? new Date();
        this.eventId = eventId ?? crypto.randomBytes(16).toString('hex');
    }
}

export abstract class EventHandler<E extends Event<any>> {
    abstract eventName(): E['name'];

    abstract handle(event: E, session: SessionCorrelationId): Promise<void>;

    abstract config(): { readonly retries: number };

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
        return '';
    }
}

export interface Answer<Q extends keyof RegisteredAnswers> {
    question(): Q;

    answer(
        params: RegisteredAnswers[Q]['takes'],
        session: SessionCorrelationId,
    ): Promise<RegisteredAnswers[Q]['returns']>;
}

export type RegisteredAnswers = TestsRegisteredAnswer;

interface TestsRegisteredAnswer {
    'Tests.First': {
        takes: { trackingId: string };
        returns: number;
    };

    'Tests.Second': {
        takes: { something: string };
        returns: boolean;
    };
}
