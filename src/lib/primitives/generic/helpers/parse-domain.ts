function ParseDomain(url: string): string | false {
    if (!url.includes('.')) return false;

    if (!url.startsWith('http')) {
        url = `http://${url}`;
    }

    try {
        const u = new URL(url);

        return u.hostname;
    } catch (e) {
        return false;
    }
}

export { ParseDomain };
