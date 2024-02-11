import { BaseNotFoundException } from '@lib/primitives/application-specific/exceptions/base-not-found-exception';
import { BuildExceptionCode } from './build-exception-code';

class NotFoundException extends BaseNotFoundException {
    constructor(msg: string, payload?: Record<string, any>) {
        super({
            code: BuildExceptionCode('NOT_FOUND'),
            message: msg,
            payload,
        });
    }
}

export { NotFoundException };
