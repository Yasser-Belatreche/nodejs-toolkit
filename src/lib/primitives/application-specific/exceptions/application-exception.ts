class ApplicationException extends Error {
    constructor(public readonly error: { code: Uppercase<string>; message: string }) {
        super(error.message);
    }
}

export { ApplicationException };
