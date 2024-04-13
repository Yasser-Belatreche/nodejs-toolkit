import { ProtectedCommand } from '@lib/primitives/application-specific/command';

export interface DeleteWebhookCommand extends ProtectedCommand {
    id: string;
}
