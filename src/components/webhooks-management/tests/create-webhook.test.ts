import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';

import { aWebhooksManagerFacade } from './fixtures/a-webhooks-manager-facade';

import { aGetEventsQuery } from './fixtures/a-get-events-query';
import { aCreateWebhookCommand } from './fixtures/a-create-webhook-command';

import { ValidationException } from '../main/core/domain/exceptions/validation-exception';
import { aGetWebhookQuery } from './fixtures/a-get-webhook-query';

await describe('create webhooks', async () => {
    const manager = aWebhooksManagerFacade();

    let command: Parameters<typeof manager.createWebhook>[0];

    beforeEach(async () => {
        const { names } = await manager.getEvents(aGetEventsQuery());

        command = aCreateWebhookCommand({ events: [names[0]] });
    });

    await it('should not be able to create a webhook with empty events', async () => {
        try {
            await manager.createWebhook({ ...command, events: [] });

            assert.fail('should throw');
        } catch (e) {
            assert.ok(e instanceof ValidationException);
        }
    });

    await it('should not be able to pass events that no exists in the system', async () => {
        try {
            await manager.createWebhook({ ...command, events: ['random'] });

            assert.fail('should throw');
        } catch (e) {
            assert.ok(e instanceof ValidationException);
        }
    });

    await it('the delivery url should be a valid https url', async () => {
        const invalidUrls = ['', 'test', 'htt://google.com', 'http://google.com'];

        for (const url of invalidUrls) {
            try {
                await manager.createWebhook({ ...command, deliveryUrl: url });

                assert.fail('should throw');
            } catch (e) {
                assert.ok(e instanceof ValidationException);
            }
        }
    });

    await it('should assign a unique id and secret to each webhook', async () => {
        const { id: id1 } = await manager.createWebhook(command);
        const { id: id2 } = await manager.createWebhook(command);

        assert.notStrictEqual(id1, id2);
    });

    await it('a webhook should be create as active', async () => {
        const { id } = await manager.createWebhook(command);

        const { isActive } = await manager.getWebhook(aGetWebhookQuery({ id }));

        assert.equal(isActive, true);
    });

    await it('should assign a unique secret to each webhook', async () => {
        const { id: id1 } = await manager.createWebhook(command);
        const { id: id2 } = await manager.createWebhook(command);

        const { secret: scrt1 } = await manager.getWebhook(aGetWebhookQuery({ id: id1 }));
        const { secret: scrt2 } = await manager.getWebhook(aGetWebhookQuery({ id: id2 }));

        assert.notStrictEqual(scrt1, scrt2);
    });
});
