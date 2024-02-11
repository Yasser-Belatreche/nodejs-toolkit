import { CommandHandler } from '@lib/primitives/generic/cqrs/command-handler';
import { EditWebhookCommand } from './edit-webhook-command';
import { EditWebhookCommandResponse } from './edit-webhook-command-response';

import { EditWebhook } from '../../domain/webhook';
import { NotFoundException } from '../../domain/exceptions/not-found-exception';

import { WebhookRepository } from '../../domain/webhook-repository';

class EditWebhookCommandHandler
    implements CommandHandler<EditWebhookCommand, EditWebhookCommandResponse>
{
    constructor(private readonly repository: WebhookRepository) {}

    async execute(command: EditWebhookCommand): Promise<EditWebhookCommandResponse> {
        const webhook = await this.repository.ofId(command.id);

        if (!webhook)
            throw new NotFoundException(`Webhook with id ${command.id} not found`, {
                id: command.id,
            });

        const edited = EditWebhook(webhook, command.events, command.deliveryUrl);

        await this.repository.update(edited);

        return { id: webhook.id };
    }
}

export { EditWebhookCommandHandler };
