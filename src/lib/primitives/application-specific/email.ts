import { ValueObject } from '@lib/primitives/generic/patterns/value-object';
import { BaseValidationException } from '@lib/primitives/application-specific/exceptions/base-validation-exception';

class Email extends ValueObject<string> {
    static readonly EMAIL_PATTERN = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,8}$/;

    static From(email: string): Email {
        email = email?.trim().toLowerCase();

        if (!this.IsValid(email))
            throw new BaseValidationException({
                code: 'EMAILS.INVALID_EMAIL',
                message: `${email} is not a valid email`,
                payload: { email },
            });

        return new Email(email);
    }

    static IsValid(email: string): boolean {
        return Email.EMAIL_PATTERN.test(email.trim().toLowerCase());
    }
}

export { Email };
