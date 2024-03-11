import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

import {
    Event,
    EventHandler,
    EventsBroker,
    UniversalEventHandler,
} from './events-broker/events-broker';
import {
    Answer,
    RegisteredAnswers,
    SyncMessagesBroker,
} from './sync-messages-broker/sync-messages-broker';

import { MessagesBroker } from './messages-broker';

class MessagesBrokerFacade implements MessagesBroker {
    constructor(
        private readonly eventsBroker: EventsBroker,
        private readonly syncMessagesBroker: SyncMessagesBroker,
    ) {}

    async publish<T extends Event<any>>(event: T, session: SessionCorrelationId): Promise<void> {
        await this.eventsBroker.publish(event, session);
    }

    registerEventHandler<T extends Event<any>>(handler: EventHandler<T>): void {
        this.eventsBroker.registerEventHandler(handler);
    }

    registerUniversalEventHandler(handler: UniversalEventHandler): void {
        this.eventsBroker.registerUniversalEventHandler(handler);
    }

    shouldExplicitlyRetryFailedEvents(): boolean {
        return this.eventsBroker.shouldExplicitlyRetryFailedEvents();
    }

    async retryFailedEvents(): Promise<void> {
        await this.eventsBroker.retryFailedEvents();
    }

    async ask<Q extends keyof RegisteredAnswers>(
        question: Q,
        params: RegisteredAnswers[Q]['takes'],
        session: SessionCorrelationId,
    ): Promise<RegisteredAnswers[Q]['returns']> {
        return await this.syncMessagesBroker.ask(question, params, session);
    }

    registerAnswer<Q extends keyof RegisteredAnswers>(answer: Answer<Q>): void {
        this.syncMessagesBroker.registerAnswer(answer);
    }

    clear(): void {
        this.eventsBroker.clear();
        this.syncMessagesBroker.clear();
    }
}

export { MessagesBrokerFacade };
