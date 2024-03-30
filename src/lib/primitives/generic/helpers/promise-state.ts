const PromiseState = async (p: Promise<any>): Promise<'pending' | 'fulfilled' | 'rejected'> => {
    const t = {};

    return await Promise.race([p, t]).then(
        v => (v === t ? 'pending' : 'fulfilled'),
        () => 'rejected',
    );
};

export { PromiseState };
