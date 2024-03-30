export interface Quota {
    limit: number;
    remaining: number;
    reset: Date | null;
}
