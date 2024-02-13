import { PaginatedListQueryResponse } from '@lib/primitives/application-specific/base-query';

import { Webhook } from '../../domain/webhook';

export interface GetWebhooksQueryResponse extends PaginatedListQueryResponse<Webhook> {}
