import { ProtectedCommand } from '@lib/primitives/application-specific/command';

export interface EnableWebhookCommand extends ProtectedCommand {
    id: string;
}
