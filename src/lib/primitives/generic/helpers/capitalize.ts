const Capitalize = (string: string, options?: { toLower: boolean }): string => {
    if (options?.toLower) string = string.toLowerCase();

    return string
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export { Capitalize };
