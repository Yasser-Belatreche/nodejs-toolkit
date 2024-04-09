import { CommandHandler } from '@lib/primitives/generic/cqrs/command-handler';
import { ChangeQuotaLimitsCommand } from './change-quota-limits-command';
import { ChangeQuotaLimitsCommandResponse } from './change-quota-limits-command-response';

import { QuotaLimitsRepository } from '../../domain/quota-limits-repository';
import { ValidationException } from '../../domain/exceptions/validation-exception';

class ChangeQuotaLimitsCommandHandler
    implements CommandHandler<ChangeQuotaLimitsCommand, ChangeQuotaLimitsCommandResponse>
{
    constructor(private readonly repository: QuotaLimitsRepository) {}

    async execute(command: ChangeQuotaLimitsCommand): Promise<ChangeQuotaLimitsCommandResponse> {
        if (command.perSecond <= 0)
            throw new ValidationException('INVALID_QUOTA', 'Per second must be greater than 0', {
                perSecond: command.perSecond,
            });

        if (command.perMinute <= 0)
            throw new ValidationException('INVALID_QUOTA', 'Per minute must be greater than 0', {
                perMinute: command.perMinute,
            });

        if (command.perHour <= 0)
            throw new ValidationException('INVALID_QUOTA', 'Per hour must be greater than 0', {
                perHour: command.perHour,
            });

        if (command.perDay <= 0)
            throw new ValidationException('INVALID_QUOTA', 'Per day must be greater than 0', {
                perDay: command.perDay,
            });

        await this.repository.update(
            command.userId,
            {
                perDay: command.perDay,
                perHour: command.perHour,
                perMinute: command.perMinute,
                perSecond: command.perSecond,
            },
            command.session,
        );

        return { userId: command.userId };
    }
}

export { ChangeQuotaLimitsCommandHandler };
