import { Log } from '@lib/logger/main/log-decorator';
import { ProtectedCommand } from '@lib/primitives/application-specific/command';
import { OptionalProperties } from '@lib/primitives/generic/types/optional-property';
import { GetComponentActionLogMessage } from '@lib/primitives/application-specific/consistency/log-messages';

import { Authorize } from '../../auth-management/main/authorize-decorator';
import { AuthorizationException } from '../../auth-management/main/core/domain/exceptions/authorization-exception';

import { WebhooksManager } from './webhooks-manager';
import { WebhooksPermissions } from './webhooks-manager-permissions';

import { CreateWebhookCommand } from './core/usecases/create-webhook/create-webhook-command';
import { CreateWebhookCommandResponse } from './core/usecases/create-webhook/create-webhook-command-response';

import { DeleteWebhookCommand } from './core/usecases/delete-webhook/delete-webhook-command';
import { DeleteWebhookCommandResponse } from './core/usecases/delete-webhook/delete-webhook-command-response';

import { EditWebhookCommand } from './core/usecases/edit-webhook/edit-webhook-command';
import { EditWebhookCommandResponse } from './core/usecases/edit-webhook/edit-webhook-command-response';

import { EnableWebhookCommand } from './core/usecases/enable-webhook/enable-webhook-command';
import { EnableWebhookCommandResponse } from './core/usecases/enable-webhook/enable-webhook-command-response';

import { DisableWebhookCommand } from './core/usecases/disable-webhook/disable-webhook-command';
import { DisableWebhookCommandResponse } from './core/usecases/disable-webhook/disable-webhook-command-response';

import { TestWebhookCommand } from './core/usecases/test-webhook/test-webhook-command';
import { TestWebhookCommandResponse } from './core/usecases/test-webhook/test-webhook-command-response';

import { GetWebhookQuery } from './core/usecases/get-webhook/get-webhook-query';
import { GetWebhookQueryResponse } from './core/usecases/get-webhook/get-webhook-query-response';

import { GetWebhooksQuery } from './core/usecases/get-webhooks/get-webhooks-query';
import { GetWebhooksQueryResponse } from './core/usecases/get-webhooks/get-webhooks-query-response';

import { GetEventsQuery } from './core/usecases/get-events/get-events-query';
import { GetEventsQueryResponse } from './core/usecases/get-events/get-events-query-response';

import { GetOutboxEventQuery } from './core/usecases/get-outbox-event/get-outbox-event-query';
import { GetOutboxEventQueryResponse } from './core/usecases/get-outbox-event/get-outbox-event-query-response';

import { GetOutboxEventsQuery } from './core/usecases/get-outbox-events/get-outbox-events-query';
import { GetOutboxEventsQueryResponse } from './core/usecases/get-outbox-events/get-outbox-events-query-response';

class WebhooksManagerAuthorizationAndLoggerDecorator implements WebhooksManager {
    constructor(private readonly manager: WebhooksManager) {}

    @Log(msg('creating webhook'))
    @Authorize(WebhooksPermissions.CreateWebhook)
    async createWebhook(
        command: OptionalProperties<CreateWebhookCommand, 'assigneeId'>,
    ): Promise<CreateWebhookCommandResponse> {
        return await this.manager.createWebhook({
            ...command,
            assigneeId: command.session.user.id,
        });
    }

    @Log(msg('deleting webhook'))
    @Authorize(WebhooksPermissions.DeleteWebhook)
    async deleteWebhook(command: DeleteWebhookCommand): Promise<DeleteWebhookCommandResponse> {
        await this.assertWebhookAccessPossiblity(command);

        return await this.manager.deleteWebhook(command);
    }

    @Log(msg('editing webhook'))
    @Authorize(WebhooksPermissions.EditWebhook)
    async editWebhook(command: EditWebhookCommand): Promise<EditWebhookCommandResponse> {
        await this.assertWebhookAccessPossiblity(command);

        return await this.manager.editWebhook(command);
    }

    @Log(msg('enabling webhook'))
    @Authorize(WebhooksPermissions.EnableWebhook)
    async enableWebhook(command: EnableWebhookCommand): Promise<EnableWebhookCommandResponse> {
        await this.assertWebhookAccessPossiblity(command);

        return await this.manager.enableWebhook(command);
    }

    @Log(msg('disabling webhook'))
    @Authorize(WebhooksPermissions.DisableWebhook)
    async disableWebhook(command: DisableWebhookCommand): Promise<DisableWebhookCommandResponse> {
        await this.assertWebhookAccessPossiblity(command);

        return await this.manager.disableWebhook(command);
    }

    @Log(msg('testing webhook'))
    @Authorize(WebhooksPermissions.TestWebhook)
    async testWebhook(command: TestWebhookCommand): Promise<TestWebhookCommandResponse> {
        await this.assertWebhookAccessPossiblity(command);

        return await this.manager.testWebhook(command);
    }

    @Log(msg('getting webhook by id'))
    @Authorize(WebhooksPermissions.GetWebhook)
    async getWebhook(query: GetWebhookQuery): Promise<GetWebhookQueryResponse> {
        const webhook = await this.manager.getWebhook(query);

        if (webhook.assigneeId !== query.session.user.id) {
            throw new AuthorizationException('You are not allowed to access this webhook');
        }

        return webhook;
    }

    @Log(msg('getting webhooks list'))
    @Authorize(WebhooksPermissions.GetWebhook)
    async getWebhooks(query: GetWebhooksQuery): Promise<GetWebhooksQueryResponse> {
        return await this.manager.getWebhooks({
            ...query,
            assigneeId: [query.session.user.id],
        });
    }

    @Log(msg('getting events'))
    @Authorize(WebhooksPermissions.GetEvents)
    async getEvents(query: GetEventsQuery): Promise<GetEventsQueryResponse> {
        return await this.manager.getEvents(query);
    }

    @Log(msg('getting outbox event by id'))
    @Authorize(WebhooksPermissions.GetOutboxEvent)
    async getOutboxEvent(query: GetOutboxEventQuery): Promise<GetOutboxEventQueryResponse> {
        const event = await this.manager.getOutboxEvent(query);

        if (event.assigneeId !== query.session.user.id) {
            throw new AuthorizationException('You are not allowed to access this outbox event');
        }

        return event;
    }

    @Log(msg('getting outbox event by id'))
    @Authorize(WebhooksPermissions.GetOutboxEvents)
    async getOutboxEvents(query: GetOutboxEventsQuery): Promise<GetOutboxEventsQueryResponse> {
        return await this.manager.getOutboxEvents({
            ...query,
            assigneeId: [query.session.user.id],
        });
    }

    private async assertWebhookAccessPossiblity(
        payload: { id: string } & ProtectedCommand,
    ): Promise<void> {
        const webhook = await this.manager.getWebhook(payload);

        if (webhook.assigneeId !== payload.session.user.id) {
            throw new AuthorizationException('You are not allowed to access this webhook');
        }
    }
}

function msg(str: string): string {
    return GetComponentActionLogMessage('webhooks manager', str);
}

export { WebhooksManagerAuthorizationAndLoggerDecorator };
