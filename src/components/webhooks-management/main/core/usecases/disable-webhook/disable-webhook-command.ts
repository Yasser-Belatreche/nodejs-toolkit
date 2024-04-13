import { ProtectedCommand } from '@lib/primitives/application-specific/command';

export interface DisableWebhookCommand extends ProtectedCommand {
    id: string;
}
