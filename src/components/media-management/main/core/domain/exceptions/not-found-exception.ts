import { BaseNotFoundException } from '@lib/primitives/application-specific/exceptions/base-not-found-exception';

class NotFoundException extends BaseNotFoundException {
    constructor(message: string) {
        super({ code: 'MEDIA.NOT_FOUND', message });
    }
}

export { NotFoundException };
