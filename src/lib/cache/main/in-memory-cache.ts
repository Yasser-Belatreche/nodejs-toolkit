import { Cache, CacheOptions } from './cache';

class InMemoryCache implements Cache {
    private readonly map = new Map<
        string,
        { value: any; createdAt: Date; options?: CacheOptions }
    >();

    private static _instance: InMemoryCache;

    static Instance(): InMemoryCache {
        if (this._instance) return this._instance;

        this._instance = new InMemoryCache();

        return this._instance;
    }

    private constructor() {}

    async get<T>(key: string): Promise<T | null> {
        const entry = this.map.get(key);

        if (!entry) return null;

        if (entry.options?.ttl) {
            if (Date.now() > entry.createdAt.getTime() + entry.options.ttl) {
                this.map.delete(key);

                return null;
            }
        }

        return entry.value;
    }

    async invalidate(key: string): Promise<void> {
        this.map.delete(key);
    }

    async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
        this.map.set(key, { value, createdAt: new Date(), options });
    }

    async clear(): Promise<void> {
        this.map.clear();
    }
}

export { InMemoryCache };
