import { Cache, CacheHealth, CacheOptions } from './cache';
import { RedisClient } from '../../persistence/main/redis-persistence';

class RedisCache implements Cache {
    private static _instance: RedisCache;

    static Instance(client: RedisClient): RedisCache {
        if (this._instance) return this._instance;

        this._instance = new RedisCache(client);

        return this._instance;
    }

    private constructor(private readonly client: RedisClient) {}

    async get<T>(key: string): Promise<T | null> {
        const value = await this.client.get(key);

        if (!value) return null;

        return JSON.parse(value);
    }

    async set<T>(key: string, value: T, options?: CacheOptions | undefined): Promise<void> {
        await this.client.set(key, JSON.stringify(value), { PX: options?.ttl });
    }

    async setNx<T>(key: string, value: T, options?: CacheOptions | undefined): Promise<boolean> {
        const result = await this.client.set(key, JSON.stringify(value), {
            PX: options?.ttl,
            NX: true,
        });

        return result === 'OK';
    }

    async invalidate(key: string): Promise<void> {
        await this.client.del(key);
    }

    async clear(): Promise<void> {
        await this.client.flushAll();
    }

    async health(): Promise<CacheHealth> {
        if (this.client.isOpen) return { provider: 'redis', status: 'up' };

        return { provider: 'redis', status: 'down', message: 'the client is disconnected' };
    }
}

export { RedisCache };
