import { ProtectedCommand } from '@lib/primitives/application-specific/command';

export interface ChangeQuotaLimitsCommand extends ProtectedCommand {
    userId: string;

    perSecond: number;
    perMinute: number;
    perHour: number;
    perDay: number;
}
