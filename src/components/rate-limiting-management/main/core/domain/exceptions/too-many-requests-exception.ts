import { BaseTooManyRequests } from '@lib/primitives/application-specific/exceptions/base-too-many-requests-exception';

class TooManyRequestsException extends BaseTooManyRequests {
    constructor() {
        super({
            code: 'TOO_MANY_REQUESTS',
            message: 'Quota exceeded. Please try again later.',
        });
    }
}

export { TooManyRequestsException };
