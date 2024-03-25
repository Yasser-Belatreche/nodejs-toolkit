export interface Cache {
    get<T>(key: string): Promise<T | null>;

    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;

    setNx<T>(key: string, value: T, options?: CacheOptions): Promise<boolean>;

    invalidate(key: string): Promise<void>;

    clear(): Promise<void>;

    health(): Promise<CacheHealth>;
}

export interface CacheHealth {
    provider: string;
    status: 'up' | 'down';
    message?: string;
}

export interface CacheOptions {
    ttl?: number;
}
