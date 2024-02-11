interface ErrorType {
    code: Uppercase<string>;
    message: string;
    payload?: Record<string, any>;
}

class ApplicationException extends Error {
    constructor(public readonly error: ErrorType) {
        super(error.message);
    }
}

export { ApplicationException };
