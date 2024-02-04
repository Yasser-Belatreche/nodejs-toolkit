export interface Persistence {
    connect(): Promise<void>;

    disconnect(): Promise<void>;

    transaction(func: () => Promise<void>): Promise<void>;

    clear(): Promise<void>;

    backup(): Promise<void>;

    restore(): Promise<void>;
}
