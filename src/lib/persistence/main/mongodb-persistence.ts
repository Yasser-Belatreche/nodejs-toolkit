import fs from 'fs';
import mongoose from 'mongoose';
import { exec } from 'child_process';

import { Persistence } from './persistence';

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
        if (!this.connection) return;

        await this.connection.disconnect();
    }

    async transaction(func: () => Promise<void>): Promise<void> {
        if (!this.connection) return;

        const session = await this.connection.startSession();

        await session.withTransaction(async () => {
            await func();
        });
    }

    async clear(): Promise<void> {
        if (!this.connection) return;

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
}

export { MongodbPersistence };
