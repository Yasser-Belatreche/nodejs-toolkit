export interface BaseDomainEvent<T> {
    name: string;
    payload: T;
}
