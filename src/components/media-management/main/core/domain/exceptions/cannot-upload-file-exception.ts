import { BaseUnknownException } from '@lib/primitives/application-specific/exceptions/base-unknown-exception';

class CannotUploadFileException extends BaseUnknownException {
    constructor(message: string) {
        super({ code: 'MEDIA.CANNOT_UPLOAD', message });
    }
}

export { CannotUploadFileException };
