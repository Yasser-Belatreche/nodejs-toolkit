import { Pagination } from '@lib/primitives/application-specific/pagination';
import { Session, SessionCorrelationId } from '@lib/primitives/application-specific/session';

export interface Query {
    session: SessionCorrelationId;
}

export interface ProtectedQuery {
    session: Session;
}

export interface PaginatedQuery extends Query {
    page?: number;
    perPage?: number;
}

export interface ProtectedPaginatedQuery extends ProtectedQuery {
    page?: number;
    perPage?: number;
}

export interface ListQueryResponse<Entity> {
    list: Entity[];
}

export interface PaginatedListQueryResponse<Entity> {
    pagination: Pagination;
    list: Entity[];
}
