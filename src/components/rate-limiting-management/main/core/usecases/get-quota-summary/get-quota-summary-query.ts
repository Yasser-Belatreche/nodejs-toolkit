import { ProtectedQuery } from '@lib/primitives/application-specific/query';

export interface GetQuotaSummaryQuery extends ProtectedQuery {
    userId: string;
    token: string;
}
