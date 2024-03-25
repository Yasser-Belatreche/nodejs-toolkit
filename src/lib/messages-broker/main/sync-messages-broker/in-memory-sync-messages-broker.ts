import { SessionCorrelationId } from '@lib/primitives/application-specific/session';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

import { SyncMessagesBroker, Answer, RegisteredAnswers } from './sync-messages-broker';

class InMemorySyncMessagesBroker implements SyncMessagesBroker {
    private readonly answers = new Map<string, Answer<any>>();

    private static _instance: InMemorySyncMessagesBroker;

    static Instance(): InMemorySyncMessagesBroker {
        if (this._instance) return this._instance;

        this._instance = new InMemorySyncMessagesBroker();

        return this._instance;
    }

    private constructor() {}

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
            throw new DeveloperException(
                'ANSWER_ALREADY_REGISTERED',
                `There is already an answer registered for the question: ${answer.question()}`,
            );
        }

        this.answers.set(answer.question(), answer);
    }

    async clear(): Promise<void> {
        this.answers.clear();
    }
}

export { InMemorySyncMessagesBroker };
