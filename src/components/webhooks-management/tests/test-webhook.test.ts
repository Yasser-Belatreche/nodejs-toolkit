import * as crypto from 'crypto';

import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';

import { aWebhooksManagerFacade } from './fixtures/a-webhooks-manager-facade';

import { aGetEventsQuery } from './fixtures/a-get-events-query';
import { aGetWebhookQuery } from './fixtures/a-get-webhook-query';
import { FakeRestClient } from './fixtures/fakes/fake-rest-client';
import { aTestWebhookCommand } from './fixtures/a-test-webhook-command';
import { aCreateWebhookCommand } from './fixtures/a-create-webhook-command';

import { NotFoundException } from '../main/core/domain/exceptions/not-found-exception';

await describe('test webhooks', async () => {
    const restClient = new FakeRestClient();
    const manager = aWebhooksManagerFacade({ restClient });

    let command: Parameters<typeof manager.testWebhook>[0];

    beforeEach(async () => {
        const { names } = await manager.getEvents(aGetEventsQuery());
        const { id } = await manager.createWebhook(aCreateWebhookCommand({ events: [names[0]] }));

        command = aTestWebhookCommand({ id });
    });

    await it('should not be able to test a webhook that does not exists', async () => {
        try {
            await manager.testWebhook({ ...command, id: 'random' });

            assert.fail('should throw');
        } catch (e) {
            assert.ok(e instanceof NotFoundException);
        }
    });

    await it("should send the test events to the webhook's url", async () => {
        const postMock = mock.fn(() => ({ status: 200, response: { message: 'ok' } }));
        mock.method(restClient, 'post', postMock);

        const response = await manager.testWebhook(command);

        const webhook = await manager.getWebhook(aGetWebhookQuery({ id: command.id }));

        assert.equal(response.id, command.id);
        assert.equal(response.outboxEvents.length, webhook.events.length);

        assert.equal(postMock.mock.calls.length, webhook.events.length);

        const args: any[] = postMock.mock.calls[0].arguments;

        assert.equal(args[0], webhook.deliveryUrl);
        assert.equal(args[1].name, webhook.events[0]);
        assert.equal(typeof args[1].eventId, 'string');
        assert.equal(typeof args[1].payload, 'object');

        assert.equal(args[2]['Content-Type'], 'application/json');
        assert.equal(args[2]['X-Webhook-Id'], webhook.id);
        assert.equal(args[2]['X-Webhook-Trigger'], webhook.events[0]);

        const hmac = crypto.createHmac('sha256', webhook.secret);
        hmac.update(JSON.stringify(args[1]));

        assert.equal(args[2]['X-Webhook-Signature'], hmac.digest('hex'));
    });
});
