import { createClient } from 'redis';
import { Persistence, PersistenceHealth } from './persistence';

export type RedisClient = ReturnType<typeof createClient>;

interface Config {
    url: string;
}

class RedisPersistence implements Persistence {
    private static _instance: RedisPersistence;

    static Instance(config: Config): RedisPersistence {
        if (this._instance) return this._instance;

        this._instance = new RedisPersistence(config);

        return this._instance;
    }

    private readonly client: ReturnType<typeof createClient>;

    private constructor(config: Config) {
        this.client = createClient({ url: config.url });
    }

    Client(): RedisClient {
        return this.client;
    }

    async connect(): Promise<void> {
        if (this.client.isOpen) return;

        await this.client.connect();
    }

    async disconnect(): Promise<void> {
        if (!this.client.isOpen) return;

        await this.client.disconnect();
    }

    async startTransaction(): Promise<void> {}

    async commitTransaction(): Promise<void> {}

    async abortTransaction(): Promise<void> {}

    shouldBackup(): boolean {
        return false;
    }

    async backup(): Promise<void> {
        if (!this.client.isOpen) return;

        await this.client.bgSave();
    }

    async restore(): Promise<void> {
        if (!this.client.isOpen) return;

        await this.client.bgRewriteAof();
    }

    async health(): Promise<PersistenceHealth> {
        if (!this.client.isOpen)
            return {
                provider: 'redis',
                status: 'down',
                message: 'the client is disconnected',
            };

        return { provider: 'redis', status: 'up' };
    }
}

export { RedisPersistence };
