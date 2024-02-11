import { Pagination } from './pagination';

export interface PaginatedQuery {
    page?: number;
    perPage?: number;
}

export interface ListWithNoPaginationQueryResponse<Entity> {
    list: Entity[];
}

export interface PaginatedListQueryResponse<Entity> {
    pagination: Pagination;
    list: Entity[];
}
