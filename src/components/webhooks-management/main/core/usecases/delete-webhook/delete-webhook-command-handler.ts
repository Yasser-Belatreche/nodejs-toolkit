import { CommandHandler } from '@lib/primitives/generic/cqrs/command-handler';
import { DeleteWebhookCommand } from './delete-webhook-command';
import { DeleteWebhookCommandResponse } from './delete-webhook-command-response';

import { WebhookRepository } from '../../domain/webhook-repository';

import { NotFoundException } from '../../domain/exceptions/not-found-exception';

class DeleteWebhookCommandHandler
    implements CommandHandler<DeleteWebhookCommand, DeleteWebhookCommandResponse>
{
    constructor(private readonly repository: WebhookRepository) {}

    async execute(command: DeleteWebhookCommand): Promise<DeleteWebhookCommandResponse> {
        const webhook = await this.repository.ofId(command.id);

        if (!webhook)
            throw new NotFoundException(`Webhook with id ${command.id} not found`, {
                id: command.id,
            });

        await this.repository.delete(webhook);

        return { id: command.id };
    }
}

export { DeleteWebhookCommandHandler };
