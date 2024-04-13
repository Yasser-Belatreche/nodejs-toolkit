import { ProtectedCommand } from '@lib/primitives/application-specific/command';

export interface CreateWebhookCommand extends ProtectedCommand {
    assigneeId: string;
    deliveryUrl: string;
    events: string[];
}
