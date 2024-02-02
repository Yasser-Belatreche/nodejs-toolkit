const wait = async (milliseconds: number): Promise<void> => {
    return await new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
};

export { wait };
