import { ProtectedQuery } from '@lib/primitives/application-specific/query';

export interface GetEventsQuery extends ProtectedQuery {
    search?: string;
}
