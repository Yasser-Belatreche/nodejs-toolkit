import { BaseValidationException } from '@lib/primitives/application-specific/exceptions/base-validation-exception';
import { BuildExceptionCode } from './build-exception-code';

class ValidationException extends BaseValidationException {
    constructor(suffix: Uppercase<string>, msg: string, payload?: Record<string, any>) {
        super({
            code: BuildExceptionCode(suffix),
            message: msg,
            payload,
        });
    }
}

export { ValidationException };
