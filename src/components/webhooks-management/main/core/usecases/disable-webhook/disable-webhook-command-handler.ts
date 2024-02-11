import { CommandHandler } from '@lib/primitives/generic/cqrs/command-handler';
import { DisableWebhookCommand } from './disable-webhook-command';
import { DisableWebhookCommandResponse } from './disable-webhook-command-response';

import { DisableWebhook } from '../../domain/webhook';
import { WebhookRepository } from '../../domain/webhook-repository';

import { NotFoundException } from '../../domain/exceptions/not-found-exception';

class DisableWebhookCommandHandler
    implements CommandHandler<DisableWebhookCommand, DisableWebhookCommandResponse>
{
    constructor(private readonly repository: WebhookRepository) {}

    async execute(command: DisableWebhookCommand): Promise<DisableWebhookCommandResponse> {
        const webhook = await this.repository.ofId(command.id);

        if (!webhook)
            throw new NotFoundException(`Webhook with id ${command.id} not found`, {
                id: command.id,
            });

        const enabled = DisableWebhook(webhook);

        await this.repository.update(enabled);

        return { id: command.id };
    }
}

export { DisableWebhookCommandHandler };
