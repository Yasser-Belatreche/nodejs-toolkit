import fs from 'fs';
import mongoose from 'mongoose';
import { exec } from 'child_process';

import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';
import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

import { Persistence, PersistenceHealth } from './persistence';

export type MongoSession = mongoose.mongo.ClientSession;

interface Config {
    uri: string;
    backupDir: string;
}

class MongodbPersistence implements Persistence {
    private connection: typeof mongoose | undefined;

    private readonly sessionRequestMap = new Map<string, mongoose.mongo.ClientSession>();

    private static _instance: MongodbPersistence;

    static Instance(config: Config): MongodbPersistence {
        if (this._instance) return this._instance;

        this._instance = new MongodbPersistence(config);

        return this._instance;
    }

    private constructor(private readonly configs: Config) {
        if (!fs.existsSync(configs.backupDir)) fs.mkdirSync(configs.backupDir, { recursive: true });
    }

    async connect(): Promise<void> {
        if (this.connection) return;

        this.connection = await mongoose.connect(this.configs.uri);
    }

    async disconnect(): Promise<void> {
        if (!this.connection)
            throw new DeveloperException('DB_NOT_CONNECTED', 'the database is not connected');

        await this.connection.disconnect();
    }

    async startTransaction(session: SessionCorrelationId): Promise<void> {
        if (!this.connection)
            throw new DeveloperException('DB_NOT_CONNECTED', 'the database is not connected');

        const clientSession = this.getSession(session);

        clientSession.startTransaction();
    }

    async abortTransaction(session: SessionCorrelationId): Promise<void> {
        if (!this.connection)
            throw new DeveloperException('DB_NOT_CONNECTED', 'the database is not connected');

        const clientSession = this.getSession(session);

        if (!clientSession.inTransaction())
            throw new DeveloperException(
                'TRANSACTION_NOT_STARTED',
                'the transaction is not started',
            );

        await clientSession.abortTransaction();
    }

    async commitTransaction(session: SessionCorrelationId): Promise<void> {
        if (!this.connection)
            throw new DeveloperException('DB_NOT_CONNECTED', 'the database is not connected');

        const clientSession = this.getSession(session);

        if (!clientSession.inTransaction())
            throw new DeveloperException(
                'TRANSACTION_NOT_STARTED',
                'the transaction is not started',
            );

        await clientSession.commitTransaction();
    }

    async clear(): Promise<void> {
        if (!this.connection)
            throw new DeveloperException('DB_NOT_CONNECTED', 'the database is not connected');

        await this.connection.connection.db.dropDatabase();
    }

    shouldBackup(): boolean {
        return true;
    }

    async backup(): Promise<void> {
        return await new Promise((resolve, reject) => {
            exec(
                `mongodump --out=${this.configs.backupDir} --uri=${this.configs.uri}`,
                (error, stdout, stderr) => {
                    if (error) reject(error.message);

                    resolve();
                },
            );
        });
    }

    async restore(): Promise<void> {
        return await new Promise((resolve, reject) => {
            exec(
                `mongorestore ${this.configs.backupDir} --uri=${this.configs.uri}`,
                (error, stdout, stderr) => {
                    if (error) reject(error.message);

                    resolve();
                },
            );
        });
    }

    async health(): Promise<PersistenceHealth> {
        if (!this.connection)
            return {
                provider: 'mongodb',
                status: 'down',
                message: 'the database is not connected',
            };

        if (this.connection.connection.readyState === 0)
            return {
                provider: 'mongodb',
                status: 'down',
                message: 'the database has disconnected',
            };

        if (this.connection.connection.readyState === 1)
            return { provider: 'mongodb', status: 'up' };

        return { provider: 'mongodb', status: 'down', message: 'the database is not connected' };
    }

    async startSession(session: SessionCorrelationId): Promise<void> {
        if (!this.connection)
            throw new DeveloperException('DB_NOT_CONNECTED', 'the database is not connected');

        const clientSession = await this.connection.startSession();

        this.sessionRequestMap.set(session.correlationId, clientSession);
    }

    async endSession(session: SessionCorrelationId): Promise<void> {
        if (!this.connection)
            throw new DeveloperException('DB_NOT_CONNECTED', 'the database is not connected');

        const clientSession = this.sessionRequestMap.get(session.correlationId);

        if (!clientSession)
            throw new DeveloperException(
                'SESSION_NOT_FOUND',
                'the session is not found, should start it first',
            );

        await clientSession.endSession();
        this.sessionRequestMap.delete(session.correlationId);
    }

    getSession(session: SessionCorrelationId): MongoSession {
        if (!this.connection)
            throw new DeveloperException('DB_NOT_CONNECTED', 'the database is not connected');

        if (!this.sessionStarted(session))
            throw new DeveloperException(
                'SESSION_NOT_STARTED',
                'the session is not started, should start it first',
            );

        const clientSession = this.sessionRequestMap.get(session.correlationId);

        return clientSession!;
    }

    sessionStarted(session: SessionCorrelationId): boolean {
        return this.sessionRequestMap.has(session.correlationId);
    }
}

export { MongodbPersistence };
