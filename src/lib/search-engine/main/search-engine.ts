// The Search Engine Interface,
// can be implemented for your ORM, Query Builder or RAW SQL

export interface SearchEngine {
    match<R extends ResourceName>(criteria: Criteria<R>): Promise<Result<R>>;
}

export class Criteria<R extends ResourceName> {
    constructor(
        readonly resource: ResourceName,
        readonly filtering: Filtering<R>,
        readonly sorting: Sorting<R>,
        readonly paginating: Paginating,
    ) {}

    static FromQueryParams<R extends ResourceName>(
        resource: R,
        queryParams: Partial<Resources[R]['filters']> & {
            page?: number;
            perPage?: number;
            sort?: Partial<Resources[R]['sortBy']>;
        },
    ): Criteria<R> {
        const { page, perPage, sort, ...filters } = queryParams;

        return new Criteria<R>(
            resource,
            Filtering.FromQueryParams<R>(filters as Partial<Resources[R]['filters']>),
            Sorting.FromQueryParams<R>({ sort }),
            Paginating.FromQueryParams({ page, perPage }),
        );
    }
}

export class Filtering<R extends ResourceName> {
    constructor(readonly fields: Partial<Resources[R]['filters']>) {}

    static FromQueryParams<R extends ResourceName>(
        queryParams: Partial<Resources[R]['filters']>,
    ): Filtering<R> {
        return new Filtering(queryParams);
    }
}

export class Sorting<R extends ResourceName> {
    private static readonly DEFAULT_FIELD = 'createdAt';
    private static readonly DEFAULT_DIRECTION = 'DESC';

    constructor(readonly fields: Partial<Resources[R]['sortBy']>) {}

    static FromQueryParams<R extends ResourceName>(queryParams: {
        sort?: Partial<Resources[R]['sortBy']>;
    }): Sorting<R> {
        const fields = queryParams.sort ?? {
            [Sorting.DEFAULT_FIELD]: Sorting.DEFAULT_DIRECTION,
        };

        return new Sorting(fields);
    }
}

export class Paginating {
    private static readonly DEFAULT_PAGE = 1;
    private static readonly DEFAULT_PER_PAGE = 10;
    private static readonly DEFAULT_MAX_PER_PAGE = 200;

    readonly skip: number;

    constructor(
        readonly page: number,
        readonly perPage: number,
    ) {
        if (this.page <= 0) {
            this.page = Paginating.DEFAULT_PAGE;
        }

        if (this.perPage <= 0) {
            this.perPage = Paginating.DEFAULT_PER_PAGE;
        }

        if (this.perPage > Paginating.DEFAULT_MAX_PER_PAGE) {
            this.perPage = Paginating.DEFAULT_MAX_PER_PAGE;
        }

        this.skip = (this.page - 1) * this.perPage;
    }

    static FromQueryParams(queryParams: { page?: number; perPage?: number }): Paginating {
        const page = queryParams.page ?? Paginating.DEFAULT_PAGE;
        const perPage = queryParams.perPage ?? Paginating.DEFAULT_PER_PAGE;

        return new Paginating(page, perPage);
    }
}

export type SortingDirection = 'ASC' | 'DESC';

export type Resources = ExampleResource;
export type ResourceName = keyof Resources;

// this is just an example, use it as a reference to create your own resources
interface ExampleResource {
    example: {
        payload: { someExample: string };
        filters: { someFilter: string };
        sortBy: { createdAt: SortingDirection };
    };
}

export interface Result<R extends ResourceName> {
    list(): Promise<Page<R>>;

    count(): Promise<number>;
}

export interface Page<R extends ResourceName> {
    pagination: Pagination;
    list: Array<Resources[R]['payload']>;
}

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

export const GetPagination = (page: number, perPage: number, total: number): Pagination => {
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
