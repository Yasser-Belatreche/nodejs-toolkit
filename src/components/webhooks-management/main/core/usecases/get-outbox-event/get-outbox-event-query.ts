import { ProtectedQuery } from '@lib/primitives/application-specific/query';

export interface GetOutboxEventQuery extends ProtectedQuery {
    id: string;
}
