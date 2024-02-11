const BuildExceptionCode = (suffix: Uppercase<string>): Uppercase<string> => {
    return `WEBHOOKS.${suffix}` as Uppercase<string>;
};

export { BuildExceptionCode };
