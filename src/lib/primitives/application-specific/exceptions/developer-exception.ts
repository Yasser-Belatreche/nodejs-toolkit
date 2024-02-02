import { ApplicationException } from './application-exception';

class DeveloperException extends ApplicationException {
    constructor(suffix: Uppercase<string>, message: string) {
        super({
            code: `DEVELOPER_ERROR.${suffix}` as Uppercase<string>,
            message,
        });
    }
}

export { DeveloperException };
