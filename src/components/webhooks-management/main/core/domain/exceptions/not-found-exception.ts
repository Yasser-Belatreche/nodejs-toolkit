import { BaseNotFoundException } from '@lib/primitives/application-specific/exceptions/base-not-found-exception';
import { BuildExceptionCode } from './build-exception-code';

class NotFoundException extends BaseNotFoundException {
    constructor(entity: 'WEBHOOK' | 'OUTBOX_EVENT', msg: string, payload?: Record<string, any>) {
        super({
            code:
                entity === 'WEBHOOK'
                    ? BuildExceptionCode('NOT_FOUND')
                    : BuildExceptionCode(`${entity}.NOT_FOUND` as Uppercase<string>),
            message: msg,
            payload,
        });
    }
}

export { NotFoundException };
