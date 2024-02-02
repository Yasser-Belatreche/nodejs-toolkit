export interface QueryHandler<Q, R> {
    handle(query: Q): Promise<R>;
}
