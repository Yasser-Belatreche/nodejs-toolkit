import { Event } from '@lib/messages-broker/main/messages-broker';

export interface OutboxEvent {
    id: string;
    webhookId: string;
    event: Event<any>;

    status: 'pending' | 'delivered' | 'failed' | 'cancelled';

    tries: number;
    firstTryAt: Date | null;
    lastTryAt: Date | null;
    lastStatusCode: number | null;
    lastResponse: string | null;

    isTest: boolean;

    createdAt: string;
    updatedAt: string;
}
