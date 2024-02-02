function DeepMerge(
    target: Record<string, any>,
    ...sources: Array<Record<string, any>>
): Record<string, any> {
    if (!sources.length) return target;

    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                DeepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return DeepMerge(target, ...sources);
}

function isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
}

export { DeepMerge };
