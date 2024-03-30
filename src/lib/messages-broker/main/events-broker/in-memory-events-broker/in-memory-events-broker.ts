import * as crypto from 'crypto';

import { SessionCorrelationId } from '@lib/primitives/application-specific/session';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

import {
    Event,
    EventHandler,
    EventsBroker,
    EventsBrokerHealth,
    UniversalEventHandler,
} from '../events-broker';

import { FailedEventsRepository } from './data-access/failed-events-repository';

class InMemoryEventsBroker implements EventsBroker {
    private readonly universalEventHandlers: UniversalEventHandler[] = [];
    private readonly eventHandlers = new Map<string, Array<EventHandler<Event<any>>>>();

    private static _instance: InMemoryEventsBroker;

    static Instance(failedEventsRepository: FailedEventsRepository): InMemoryEventsBroker {
        if (this._instance) return this._instance;

        this._instance = new InMemoryEventsBroker(failedEventsRepository);

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
                    eventOccuredAt: event.occurredAt,
                    handlerId: handler.id(),
                    handlerMaxRetries: handler.config().retries ?? 0,
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
                    eventOccuredAt: event.occurredAt,
                    handlerId: handler.id(),
                    handlerMaxRetries: handler.config().retries ?? 0,
                    sessionCorrelationId: session.correlationId,

                    retries: 0,
                    lastError: e as Error,
                    lastProcessingTryDate: new Date(),
                    processedSuccessfully: false,
                });
            }
        }
    }

    shouldExplicitlyRetryFailedEvents(): boolean {
        return true;
    }

    async retryFailedEvents(): Promise<void> {
        const list = await this.failedEventsRepository.findAllUnsuccessfullWithRetriesLessThanMax();

        for (const failed of list) {
            const handler =
                this.eventHandlers
                    .get(failed.event.name)
                    ?.find(h => h.idEquals(failed.handlerId)) ??
                this.universalEventHandlers.find(h => h.idEquals(failed.handlerId));

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

    async registerEventHandler<T extends Event<any>>(handler: EventHandler<T>): Promise<void> {
        if (handler.config().disabled) return;

        const foundInUniversal = !!this.universalEventHandlers.find(h => h.idEquals(handler.id()));
        const foundInEventHandlers = !!Array.from(this.eventHandlers.values()).find(h =>
            h.find(eh => eh.idEquals(handler.id())),
        );

        if (foundInUniversal || foundInEventHandlers)
            throw new DeveloperException(
                'EVENT_HANDLER_ALREADY_REGISTERED',
                `There is already a handler registered with the id: ${handler.id()}`,
            );

        if (!this.eventHandlers.has(handler.eventName())) {
            this.eventHandlers.set(handler.eventName(), []);
        }

        this.eventHandlers.get(handler.eventName())!.push(handler);
    }

    async registerUniversalEventHandler(handler: UniversalEventHandler): Promise<void> {
        if (handler.config().disabled) return;

        const foundInUniversal = !!this.universalEventHandlers.find(h => h.idEquals(handler.id()));
        const foundInEventHandlers = !!Array.from(this.eventHandlers.values()).find(h =>
            h.find(eh => eh.idEquals(handler.id())),
        );

        if (foundInUniversal || foundInEventHandlers)
            throw new DeveloperException(
                'EVENT_HANDLER_ALREADY_REGISTERED',
                `There is already a handler registered with the id: ${handler.id()}`,
            );

        this.universalEventHandlers.push(handler);
    }

    async clear(): Promise<void> {
        this.eventHandlers.clear();
        this.universalEventHandlers.length = 0;
    }

    async health(): Promise<EventsBrokerHealth> {
        return { provider: 'in-memory', status: 'up' };
    }
}

export { InMemoryEventsBroker };
