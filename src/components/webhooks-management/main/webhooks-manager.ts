import { OptionalProperties } from '@lib/primitives/generic/types/optional-property';

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

import { GetWebhooksQuery } from './core/usecases/get-webhooks/get-webhooks-query';
import { GetWebhooksQueryResponse } from './core/usecases/get-webhooks/get-webhooks-query-response';

import { GetWebhookQuery } from './core/usecases/get-webhook/get-webhook-query';
import { GetWebhookQueryResponse } from './core/usecases/get-webhook/get-webhook-query-response';

import { GetEventsQuery } from './core/usecases/get-events/get-events-query';
import { GetEventsQueryResponse } from './core/usecases/get-events/get-events-query-response';

import { GetOutboxEventQuery } from './core/usecases/get-outbox-event/get-outbox-event-query';
import { GetOutboxEventQueryResponse } from './core/usecases/get-outbox-event/get-outbox-event-query-response';

import { GetOutboxEventsQuery } from './core/usecases/get-outbox-events/get-outbox-events-query';
import { GetOutboxEventsQueryResponse } from './core/usecases/get-outbox-events/get-outbox-events-query-response';

export interface WebhooksManager {
    createWebhook(
        command: OptionalProperties<CreateWebhookCommand, 'assigneeId'>,
    ): Promise<CreateWebhookCommandResponse>;

    deleteWebhook(command: DeleteWebhookCommand): Promise<DeleteWebhookCommandResponse>;

    editWebhook(command: EditWebhookCommand): Promise<EditWebhookCommandResponse>;

    enableWebhook(command: EnableWebhookCommand): Promise<EnableWebhookCommandResponse>;

    disableWebhook(command: DisableWebhookCommand): Promise<DisableWebhookCommandResponse>;

    testWebhook(command: TestWebhookCommand): Promise<TestWebhookCommandResponse>;

    getWebhook(query: GetWebhookQuery): Promise<GetWebhookQueryResponse>;

    getWebhooks(query: GetWebhooksQuery): Promise<GetWebhooksQueryResponse>;

    getEvents(query: GetEventsQuery): Promise<GetEventsQueryResponse>;

    getOutboxEvent(query: GetOutboxEventQuery): Promise<GetOutboxEventQueryResponse>;

    getOutboxEvents(query: GetOutboxEventsQuery): Promise<GetOutboxEventsQueryResponse>;
}
