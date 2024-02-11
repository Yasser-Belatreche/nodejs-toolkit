import { Permissions } from '@lib/primitives/application-specific/permissions';

export const WebhooksManagerPermissions = {
    CreateWebhook: 'webhooks/write/create',
    EditBulkWebhooks: 'webhooks/write/edit',
    DeleteWebhook: 'webhooks/write/delete',
    EnableWebhook: 'webhooks/write/enable',
    DisableWebhook: 'webhooks/write/disable',

    GetWebhook: 'webhooks/read/one',
    GetWebhooks: 'webhooks/read/list',
    GetEvents: 'webhooks/read/events',

    ReadAll: 'webhooks/read/*',
    WriteAll: 'webhooks/write/*',
    All: 'webhooks/*',
} satisfies Permissions;
