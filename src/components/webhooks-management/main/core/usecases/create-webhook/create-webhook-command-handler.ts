import { CommandHandler } from '@lib/primitives/generic/cqrs/command-handler';
import { CreateWebhookCommand } from './create-webhook-command';
import { CreateWebhookCommandResponse } from './create-webhook-command-response';

import { CreateWebhook } from '../../domain/webhook';

import { WebhookRepository } from '../../domain/webhook-repository';

class CreateWebhookCommandHandler
    implements CommandHandler<CreateWebhookCommand, CreateWebhookCommandResponse>
{
    constructor(private readonly repository: WebhookRepository) {}

    async execute(command: CreateWebhookCommand): Promise<CreateWebhookCommandResponse> {
        const webhook = await CreateWebhook(
            command.assigneeId,
            command.deliveryUrl,
            command.events,
            command.createdBy,
        );

        await this.repository.create(webhook);

        return { id: webhook.id };
    }
}

export { CreateWebhookCommandHandler };
