import { ProtectedCommand } from '@lib/primitives/application-specific/command';

export interface EditWebhookCommand extends ProtectedCommand {
    id: string;
    deliveryUrl: string;
    events: string[];
}
