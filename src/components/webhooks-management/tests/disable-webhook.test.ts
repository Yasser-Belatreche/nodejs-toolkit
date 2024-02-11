import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';

import { aWebhooksManagerFacade } from './fixtures/a-webhooks-manager-facade';

import { aGetEventsQuery } from './fixtures/a-get-events-query';
import { aGetWebhookQuery } from './fixtures/a-get-webhook-query';
import { aCreateWebhookCommand } from './fixtures/a-create-webhook-command';
import { aDisableWebhookCommand } from './fixtures/a-disable-webhook-command';

import { NotFoundException } from '../main/core/domain/exceptions/not-found-exception';
import { ValidationException } from '../main/core/domain/exceptions/validation-exception';

await describe('disable webhooks', async () => {
    const manager = aWebhooksManagerFacade();

    let command: Parameters<typeof manager.disableWebhook>[0];

    beforeEach(async () => {
        const { names } = await manager.getEvents(aGetEventsQuery());
        const { id } = await manager.createWebhook(aCreateWebhookCommand({ events: [names[0]] }));

        command = aDisableWebhookCommand({ id });
    });

    await it('should not be able to disable a webhook that does not exists', async () => {
        try {
            await manager.disableWebhook({ ...command, id: 'random' });

            assert.fail('should throw');
        } catch (e) {
            assert.ok(e instanceof NotFoundException);
        }
    });

    await it('should be able to disable a webhook successfully', async () => {
        await manager.disableWebhook(command);

        const { isActive } = await manager.getWebhook(aGetWebhookQuery({ id: command.id }));

        assert.equal(isActive, false);
    });

    await it('should be able to disable a webhook twice', async () => {
        await manager.disableWebhook(command);

        try {
            await manager.disableWebhook(command);

            assert.fail('should throw');
        } catch (e) {
            assert.ok(e instanceof ValidationException);
        }
    });
});
