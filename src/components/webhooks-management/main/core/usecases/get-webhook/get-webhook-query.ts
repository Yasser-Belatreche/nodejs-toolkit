import { ProtectedQuery } from '@lib/primitives/application-specific/query';

export interface GetWebhookQuery extends ProtectedQuery {
    id: string;
}
