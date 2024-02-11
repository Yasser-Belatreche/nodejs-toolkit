const IsValidHttpUrl = (url: string, options?: { secure: boolean }): boolean => {
    try {
        const u = new URL(url);

        if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;

        if (options?.secure && u.protocol !== 'https:') return false;

        return true;
    } catch (e) {
        return false;
    }
};

export { IsValidHttpUrl };
