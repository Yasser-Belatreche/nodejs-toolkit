import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

import {
    Event,
    EventHandler,
    EventsBroker,
    EventsBrokerHealth,
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

    async registerEventHandler<T extends Event<any>>(handler: EventHandler<T>): Promise<void> {
        await this.eventsBroker.registerEventHandler(handler);
    }

    async registerUniversalEventHandler(handler: UniversalEventHandler): Promise<void> {
        await this.eventsBroker.registerUniversalEventHandler(handler);
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

    async clear(): Promise<void> {
        await this.eventsBroker.clear();
        await this.syncMessagesBroker.clear();
    }

    async health(): Promise<EventsBrokerHealth> {
        return await this.eventsBroker.health();
    }
}

export { MessagesBrokerFacade };
