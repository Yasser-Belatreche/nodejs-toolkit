import { createClient } from 'redis';

import { Cache, CacheHealth, CacheOptions } from './cache';

interface Config {
    url: string;
}

class RedisCache implements Cache {
    private static _instance: RedisCache;

    static Instance(config: Config): RedisCache {
        if (this._instance) return this._instance;

        this._instance = new RedisCache(config);

        return this._instance;
    }

    private client: ReturnType<typeof createClient> | undefined;

    private constructor(private readonly config: Config) {}

    async get<T>(key: string): Promise<T | null> {
        await this.assertConnected();

        const value = await this.client!.get(key);

        if (!value) return null;

        return JSON.parse(value);
    }

    async set<T>(key: string, value: T, options?: CacheOptions | undefined): Promise<void> {
        await this.assertConnected();

        await this.client!.set(key, JSON.stringify(value), { PX: options?.ttl });
    }

    async setNx<T>(key: string, value: T, options?: CacheOptions | undefined): Promise<boolean> {
        await this.assertConnected();

        const result = await this.client!.set(key, JSON.stringify(value), {
            PX: options?.ttl,
            NX: true,
        });

        return result === 'OK';
    }

    async invalidate(key: string): Promise<void> {
        await this.assertConnected();

        await this.client!.del(key);
    }

    async clear(): Promise<void> {
        await this.assertConnected();

        await this.client!.flushAll();
        await this.client!.disconnect();
    }

    private async assertConnected(): Promise<void> {
        if (this.client?.isOpen) return;

        this.client = createClient({ url: this.config.url });

        this.client.on('error', error => {
            console.error(error);
        });

        await this.client.connect();
    }

    async health(): Promise<CacheHealth> {
        if (!this.client)
            return {
                provider: 'redis',
                status: 'down',
                message: 'the connection is not open because the cache did not get used yet',
            };

        if (this.client.isOpen) return { provider: 'redis', status: 'up' };

        return { provider: 'redis', status: 'down', message: 'the client is disconnected' };
    }
}

export { RedisCache };
