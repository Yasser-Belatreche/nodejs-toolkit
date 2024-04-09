import { CommandHandler } from '@lib/primitives/generic/cqrs/command-handler';
import { ThrottleCommand } from './throttle-command';
import { ThrottleCommandResponse } from './throttle-command-response';

import { RateLimitingAlgorithm } from '../../domain/rate-limiting-algorithm';
import { GetQuotaLimitsQueryHandler } from '../get-quota-limits/get-quota-limits-query-handler';

class ThrottleCommandHandler implements CommandHandler<ThrottleCommand, ThrottleCommandResponse> {
    constructor(
        private readonly algorithm: RateLimitingAlgorithm,
        private readonly limitsQuery: GetQuotaLimitsQueryHandler,
    ) {}

    async execute(command: ThrottleCommand): Promise<ThrottleCommandResponse> {
        const limits = await this.limitsQuery.handle({
            userId: command.userId,
            session: command.session as any,
        });

        const res = await this.algorithm.request(
            command.userId,
            command.token,
            command.score,
            limits,
        );

        if (!res.success()) throw res.error();

        return res.unpack();
    }
}

export { ThrottleCommandHandler };
