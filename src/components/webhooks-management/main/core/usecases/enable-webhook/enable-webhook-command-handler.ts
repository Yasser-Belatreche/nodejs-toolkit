import { CommandHandler } from '@lib/primitives/generic/cqrs/command-handler';
import { EnableWebhookCommand } from './enable-webhook-command';
import { EnableWebhookCommandResponse } from './enable-webhook-command-response';

import { EnableWebhook } from '../../domain/webhook';
import { WebhookRepository } from '../../domain/webhook-repository';

import { NotFoundException } from '../../domain/exceptions/not-found-exception';

class EnableWebhookCommandHandler
    implements CommandHandler<EnableWebhookCommand, EnableWebhookCommandResponse>
{
    constructor(private readonly repository: WebhookRepository) {}

    async execute(command: EnableWebhookCommand): Promise<EnableWebhookCommandResponse> {
        const webhook = await this.repository.ofId(command.id);

        if (!webhook)
            throw new NotFoundException(`Webhook with id ${command.id} not found`, {
                id: command.id,
            });

        const enabled = EnableWebhook(webhook);

        await this.repository.update(enabled);

        return { id: command.id };
    }
}

export { EnableWebhookCommandHandler };
