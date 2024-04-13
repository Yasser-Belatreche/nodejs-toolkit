import { PaginatedQuery } from './query';
import { BaseValidationException } from './exceptions/base-validation-exception';

export interface Pagination {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    firstPage: number;
    lastPage: number;
    nextPage: number | null;
    prevPage: number | null;
}

const getPageAndPerPage = (
    query: PaginatedQuery,
): { page: number; perPage: number; totalToSkip: number } => {
    const page = query.page ?? DEFAULT_PAGE;
    let perPage = query.perPage ?? DEFAULT_PER_PAGE;

    if (page < 1)
        throw new BaseValidationException({
            code: 'PAGINATION.INVALID_PAGE_NUMBER',
            message: 'page number must be greater than 0',
        });

    if (perPage < 0)
        throw new BaseValidationException({
            code: 'PAGINATION.INVALID_PER_PAGE_NUMBER',
            message: 'per page number must be greater than 0',
        });

    if (perPage > MAX_PER_PAGE) perPage = MAX_PER_PAGE;
    if (perPage === 0) perPage = DEFAULT_PER_PAGE;

    return { page, perPage, totalToSkip: (page - 1) * perPage };
};

const getPagination = (page: number, perPage: number, total: number): Pagination => {
    return {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        hasMore: page < Math.ceil(total / perPage),
        firstPage: 1,
        lastPage: Math.ceil(total / perPage),
        nextPage: page < Math.ceil(total / perPage) ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
    };
};

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 30;
const MAX_PER_PAGE = 200;

export { getPagination, getPageAndPerPage };
