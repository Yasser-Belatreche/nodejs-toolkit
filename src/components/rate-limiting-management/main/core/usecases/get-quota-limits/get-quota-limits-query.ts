import { ProtectedQuery } from '@lib/primitives/application-specific/query';

export interface GetQuotaLimitsQuery extends ProtectedQuery {
    userId: string;
}
