import * as crypto from 'crypto';

import { SessionCorrelationId } from '@lib/primitives/application-specific/session';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

import {
    Answer,
    Event,
    EventHandler,
    MessagesBroker,
    RegisteredAnswers,
    UniversalEventHandler,
} from './messages-broker';

import { FailedEventsRepository } from './data-access/failed-events-repository';

class InMemoryMessagesBroker implements MessagesBroker {
    private readonly universalEventHandlers: UniversalEventHandler[] = [];
    private readonly eventHandlers = new Map<string, Array<EventHandler<Event<any>>>>();
    private readonly answers = new Map<string, Answer<any>>();

    private static _instance: InMemoryMessagesBroker;

    static Instance(failedEventsRepository: FailedEventsRepository): InMemoryMessagesBroker {
        if (this._instance) return this._instance;

        this._instance = new InMemoryMessagesBroker(failedEventsRepository);

        return this._instance;
    }

    private constructor(private readonly failedEventsRepository: FailedEventsRepository) {}

    async publish<T extends Event<any>>(event: T, session: SessionCorrelationId): Promise<void> {
        for (const handler of this.universalEventHandlers) {
            try {
                await handler.handle(event, session);
            } catch (e) {
                await this.failedEventsRepository.save({
                    id: crypto.randomUUID(),
                    event,
                    handlerId: handler.id(),
                    handlerMaxRetries: handler.config?.().retries ?? 0,
                    sessionCorrelationId: session.correlationId,

                    retries: 0,
                    lastError: e as Error,
                    lastProcessingTryDate: new Date(),
                    processedSuccessfully: false,
                });
            }
        }

        const handlers = this.eventHandlers.get(event.name);

        if (!handlers) return;

        for (const handler of handlers) {
            try {
                await handler.handle(event, session);
            } catch (e) {
                await this.failedEventsRepository.save({
                    id: crypto.randomUUID(),
                    event,
                    handlerId: handler.id(),
                    handlerMaxRetries: handler.config?.().retries ?? 0,
                    sessionCorrelationId: session.correlationId,

                    retries: 0,
                    lastError: e as Error,
                    lastProcessingTryDate: new Date(),
                    processedSuccessfully: false,
                });
            }
        }
    }

    async retryFailedEvents(): Promise<void> {
        const list =
            await this.failedEventsRepository.findUnsuccessfullEventsWithRetriesLessThanMax();

        for (const failed of list) {
            const handler = this.eventHandlers
                .get(failed.event.name)
                ?.find(h => h.idEquals(failed.handlerId));

            if (!handler) continue;

            failed.lastProcessingTryDate = new Date();
            failed.retries++;

            try {
                await handler.handle(failed.event, { correlationId: failed.sessionCorrelationId });

                failed.processedSuccessfully = true;
            } catch (e) {
                failed.lastError = e as Error;
            }

            await this.failedEventsRepository.save(failed);
        }
    }

    registerEventHandler<T extends Event<any>>(handler: EventHandler<T>): void {
        if (!this.eventHandlers.has(handler.eventName())) {
            this.eventHandlers.set(handler.eventName(), []);
        }

        this.eventHandlers.get(handler.eventName())!.push(handler);
    }

    registerUniversalEventHandler(handler: UniversalEventHandler): void {
        this.universalEventHandlers.push(handler);
    }

    async ask<R>(
        question: string,
        params: Record<string, any>,
        session: SessionCorrelationId,
    ): Promise<R> {
        const answer = this.answers.get(question);

        if (!answer) {
            throw new DeveloperException(
                'ANSWER_NOT_REGISTERED',
                `There is no answer registered for the question: ${question}`,
            );
        }

        return await answer.answer(params, session);
    }

    registerAnswer<Q extends keyof RegisteredAnswers>(answer: Answer<Q>): void {
        if (this.answers.has(answer.question())) {
            throw new Error(
                `There is already an answer registered for the question: ${answer.question()}`,
            );
        }

        this.answers.set(answer.question(), answer);
    }

    clear(): void {
        this.eventHandlers.clear();
        this.answers.clear();
    }
}

export { InMemoryMessagesBroker };
