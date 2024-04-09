import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

export interface Persistence {
    connect(): Promise<void>;

    disconnect(): Promise<void>;

    startTransaction(session: SessionCorrelationId): Promise<void>;

    commitTransaction(session: SessionCorrelationId): Promise<void>;

    abortTransaction(session: SessionCorrelationId): Promise<void>;

    shouldBackup(): boolean;

    backup(): Promise<void>;

    restore(): Promise<void>;

    health(): Promise<PersistenceHealth>;
}

export interface PersistenceHealth {
    provider: string;
    status: 'up' | 'down';
    message?: string;
}
