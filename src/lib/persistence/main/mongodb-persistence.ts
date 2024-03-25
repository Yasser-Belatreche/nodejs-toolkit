import fs from 'fs';
import mongoose from 'mongoose';
import { exec } from 'child_process';

import { Persistence, PersistenceHealth } from './persistence';
import { DeveloperException } from '../../primitives/application-specific/exceptions/developer-exception';

interface Config {
    uri: string;
    backupDir: string;
}

class MongodbPersistence implements Persistence {
    private connection: typeof mongoose | undefined;

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

    async transaction<T>(func: () => Promise<T>): Promise<T> {
        if (!this.connection)
            throw new DeveloperException('DB_NOT_CONNECTED', 'the database is not connected');

        const session = await this.connection.startSession();

        let result: T;

        await session.withTransaction(async () => {
            result = await func();
        });

        return result!;
    }

    async clear(): Promise<void> {
        if (!this.connection)
            throw new DeveloperException('DB_NOT_CONNECTED', 'the database is not connected');

        await this.connection.connection.db.dropDatabase();
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

        if (this.connection.connection.readyState === 1) return { status: 'up' };

        return { provider: 'mongodb', status: 'down', message: 'the database is not connected' };
    }
}

export { MongodbPersistence };
