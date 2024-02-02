class Result<Success, Err> {
    static Ok<Success, Err>(data: Success): Result<Success, Err> {
        return new Result(true, data, null as Err);
    }

    static Fail<Success, Err>(error: Err): Result<Success, Err> {
        return new Result(false, null as Success, error);
    }

    private constructor(
        private readonly isSuccess: boolean,
        private readonly data: Success | null,
        private readonly err: Err | null,
    ) {}

    success(): boolean {
        return this.isSuccess;
    }

    unpack(): Success {
        if (!this.success()) throw new Error('cannot call unpack on error');

        return this.data!;
    }

    error(): Err {
        if (this.success()) throw new Error('cannot call error on success');

        return this.err!;
    }
}

export { Result };
