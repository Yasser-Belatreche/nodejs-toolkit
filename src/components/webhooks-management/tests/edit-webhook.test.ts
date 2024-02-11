import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';

import { aWebhooksManagerFacade } from './fixtures/a-webhooks-manager-facade';

import { aGetEventsQuery } from './fixtures/a-get-events-query';
import { aGetWebhookQuery } from './fixtures/a-get-webhook-query';
import { anEditWebhookCommand } from './fixtures/an-edit-webhook-command';
import { aDeleteWebhookCommand } from './fixtures/a-delete-webhook-command';
import { aCreateWebhookCommand } from './fixtures/a-create-webhook-command';

import { NotFoundException } from '../main/core/domain/exceptions/not-found-exception';
import { ValidationException } from '../main/core/domain/exceptions/validation-exception';

await describe('edit webhooks', async () => {
    const manager = aWebhooksManagerFacade();

    let command: Parameters<typeof manager.editWebhook>[0];

    beforeEach(async () => {
        const { names } = await manager.getEvents(aGetEventsQuery());
        const { id } = await manager.createWebhook(aCreateWebhookCommand({ events: [names[0]] }));

        command = anEditWebhookCommand({ id, events: [names[0]] });
    });

    await it('should not be able to edit a webhook that does not exists', async () => {
        await manager.deleteWebhook(aDeleteWebhookCommand({ id: command.id }));

        try {
            await manager.editWebhook({ ...command, id: 'random' });

            assert.fail('should throw');
        } catch (e) {
            assert.ok(e instanceof NotFoundException);
        }
    });

    await it('should not be able to edit a webhook with empty events', async () => {
        try {
            await manager.editWebhook({ ...command, events: [] });

            assert.fail('should throw');
        } catch (e) {
            assert.ok(e instanceof ValidationException);
        }
    });

    await it('should not be able to pass events that no exists in the system', async () => {
        try {
            await manager.editWebhook({ ...command, events: ['random'] });

            assert.fail('should throw');
        } catch (e) {
            assert.ok(e instanceof ValidationException);
        }
    });

    await it('the delivery url should be a valid https url', async () => {
        const invalidUrls = ['', 'test', 'htt://google.com', 'http://google.com'];

        for (const url of invalidUrls) {
            try {
                await manager.editWebhook({ ...command, deliveryUrl: url });

                assert.fail('should throw');
            } catch (e) {
                assert.ok(e instanceof ValidationException);
            }
        }
    });

    await it('should update the target webhook', async () => {
        const { id } = await manager.editWebhook(command);

        const webhook = await manager.getWebhook(aGetWebhookQuery({ id }));

        assert.equal(webhook.deliveryUrl, command.deliveryUrl);
        assert.equal(webhook.events, command.events);
    });
});
