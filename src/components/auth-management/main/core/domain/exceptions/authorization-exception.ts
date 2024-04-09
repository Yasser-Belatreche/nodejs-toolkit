import { BaseAuthorizationException } from '@lib/primitives/application-specific/exceptions/base-authorization-exception';

class AuthorizationException extends BaseAuthorizationException {
    constructor(message: string) {
        super({ code: 'AUTH.NOT_AUTHORIZED', message });
    }
}

export { AuthorizationException };
