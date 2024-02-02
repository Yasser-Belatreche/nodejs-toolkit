export type OptionalProperties<T extends Record<string, any>, P extends keyof T> = Omit<T, P> &
    Partial<Pick<T, P>>;
