import { BaseAuthenticationException } from '@lib/primitives/application-specific/exceptions/base-authentication-exception';

class AuthenticationException extends BaseAuthenticationException {
    constructor(suffix: Uppercase<string>, message: string) {
        super({
            code: `AUTH_${suffix}` as Uppercase<string>,
            message,
        });
    }
}

export { AuthenticationException };
