export interface Cache {
    get<T>(key: string): Promise<T | null>;

    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;

    invalidate(key: string): Promise<void>;

    clear(): Promise<void>;
}

export interface CacheOptions {
    ttl?: number;
}
