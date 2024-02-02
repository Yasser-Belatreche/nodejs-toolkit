const RemoveProperties = <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[],
): Omit<T, K> => {
    const result: T = { ...obj };

    if (keys.length === 0) return result;

    for (const key of keys) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete result[key];
    }

    return result;
};

export { RemoveProperties };
