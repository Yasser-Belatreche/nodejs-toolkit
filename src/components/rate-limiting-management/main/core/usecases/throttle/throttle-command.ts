import { Command } from '@lib/primitives/application-specific/command';

export interface ThrottleCommand extends Command {
    userId: string;
    token: string;
    score: number;
}
