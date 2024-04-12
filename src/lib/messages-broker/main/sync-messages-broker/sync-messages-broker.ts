import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

import { MediaRegisteredAnswers } from '../../../../components/media-management/main/core/registered-answers/registered-answers';

export interface SyncMessagesBroker {
    ask<Q extends keyof RegisteredAnswers>(
        question: Q,
        params: RegisteredAnswers[Q]['takes'],
        session: SessionCorrelationId,
    ): Promise<RegisteredAnswers[Q]['returns']>;

    registerAnswer<Q extends keyof RegisteredAnswers>(answer: Answer<Q>): void;

    clear(): Promise<void>;
}

export interface Answer<Q extends keyof RegisteredAnswers> {
    question(): Q;

    answer(
        params: RegisteredAnswers[Q]['takes'],
        session: SessionCorrelationId,
    ): Promise<RegisteredAnswers[Q]['returns']>;
}

export type RegisteredAnswers = TestsRegisteredAnswer & MediaRegisteredAnswers;

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
