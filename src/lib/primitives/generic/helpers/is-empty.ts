const IsEmpty = (value: string | any[]): boolean => {
    if (typeof value === 'string') {
        return !value?.trim();
    }

    return value.length === 0;
};

export { IsEmpty };
