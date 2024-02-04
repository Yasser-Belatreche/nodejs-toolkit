import { SessionCorrelationId } from '@lib/primitives/application-specific/session';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

import { Answer, Event, EventHandler, MessagesBroker, RegisteredAnswers } from './messages-broker';

class InMemoryMessagesBroker implements MessagesBroker {
    private readonly eventHandlers = new Map<string, Array<EventHandler<Event<any>>>>();
    private readonly answers = new Map<string, Answer<any>>();

    async publish<T extends Event<any>>(event: T, session: SessionCorrelationId): Promise<void> {
        const handlers = this.eventHandlers.get(event.name);

        if (!handlers) return;

        for (const handler of handlers) {
            const retry = handler.config?.().retry ?? 2;

            handler.handle(event, session).catch(async () => {
                if (retry === 0) return;

                let failures = 1;

                while (failures <= retry) {
                    try {
                        await handler.handle(event, session);

                        break;
                    } catch (error) {
                        failures++;
                    }
                }
            });
        }
    }

    registerEventHandler<T extends Event<any>>(handler: EventHandler<T>): void {
        if (!this.eventHandlers.has(handler.eventName)) {
            this.eventHandlers.set(handler.eventName, []);
        }

        this.eventHandlers.get(handler.eventName)!.push(handler);
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
        if (this.answers.has(answer.question)) {
            throw new Error(
                `There is already an answer registered for the question: ${answer.question}`,
            );
        }

        this.answers.set(answer.question, answer);
    }

    clear(): void {
        this.eventHandlers.clear();
        this.answers.clear();
    }
}

export { InMemoryMessagesBroker };
