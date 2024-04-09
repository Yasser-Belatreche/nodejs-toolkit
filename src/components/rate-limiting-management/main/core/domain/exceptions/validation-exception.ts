import { BaseValidationException } from '@lib/primitives/application-specific/exceptions/base-validation-exception';

class ValidationException extends BaseValidationException {
    constructor(
        suffix: Uppercase<string>,
        message: string,
        meta?: Record<string, string | number>,
    ) {
        super({
            code: `RATE_LIMITING.${suffix}` as Uppercase<string>,
            message,
            payload: meta,
        });
    }
}

export { ValidationException };
