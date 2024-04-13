import { ProtectedCommand } from '@lib/primitives/application-specific/command';

export interface TestWebhookCommand extends ProtectedCommand {
    id: string;
}
