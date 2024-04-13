import { PaginatedListQueryResponse } from '@lib/primitives/application-specific/query';

import { OutboxEvent } from '../../domain/outbox-event';

export interface GetOutboxEventsQueryResponse extends PaginatedListQueryResponse<OutboxEvent> {}
