import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';

import { aWebhooksManagerFacade } from './fixtures/a-webhooks-manager-facade';

import { aGetEventsQuery } from './fixtures/a-get-events-query';
import { aGetWebhookQuery } from './fixtures/a-get-webhook-query';
import { aCreateWebhookCommand } from './fixtures/a-create-webhook-command';
import { aDeleteWebhookCommand } from './fixtures/a-delete-webhook-command';

import { NotFoundException } from '../main/core/domain/exceptions/not-found-exception';

await describe('delete webhooks', async () => {
    const manager = aWebhooksManagerFacade();

    let command: Parameters<typeof manager.deleteWebhook>[0];

    beforeEach(async () => {
        const { names } = await manager.getEvents(aGetEventsQuery());
        const { id } = await manager.createWebhook(aCreateWebhookCommand({ events: [names[0]] }));

        command = aDeleteWebhookCommand({ id });
    });

    await it('should not be able to delete a webhook that does not exists', async () => {
        try {
            await manager.deleteWebhook({ ...command, id: 'random' });

            assert.fail('should throw');
        } catch (e) {
            assert.ok(e instanceof NotFoundException);
        }
    });

    await it('should be able to delete a webhook successfully', async () => {
        await manager.deleteWebhook(command);

        try {
            await manager.getWebhook(aGetWebhookQuery({ id: command.id }));

            assert.fail('should throw');
        } catch (e) {
            assert.ok(e instanceof NotFoundException);
        }
    });
});
