import { Builder } from '@lib/primitives/generic/patterns/builder';

class QueryBuilder implements Builder<Record<string, any>> {
    static aBuilder(initQuery?: Record<string, any>): QueryBuilder {
        return new QueryBuilder(initQuery);
    }

    private readonly query: Record<string, any> = {};

    private constructor(initQuery?: Record<string, any>) {
        this.query = { ...initQuery };
    }

    has(field: string): boolean {
        return !!this.query[field];
    }

    get(field: string): any | undefined {
        return this.query[field];
    }

    addPrimitiveFilter(
        field: string,
        value: string | number | boolean | Date | undefined | null,
        options: { ignoreEmptyString: boolean } = { ignoreEmptyString: true },
    ): this {
        if (this.shouldIgnore(value, options) && value !== null) return this;

        this.query[field] = value;

        return this;
    }

    addNotEqualPrimitiveFilter(
        field: string,
        value: string | number | boolean | Date | undefined | null,
        options: { ignoreEmptyString: boolean } = { ignoreEmptyString: true },
    ): this {
        if (this.shouldIgnore(value, options) && value !== null) return this;

        this.query[field] = { $ne: value };

        return this;
    }

    addArrayFilter<T extends string | number | boolean | Date>(
        field: string,
        value: T[] | undefined | null,
        options: { ignoreEmpty: boolean } = { ignoreEmpty: true },
    ): this {
        if (this.shouldIgnore(value)) return this;

        if (options.ignoreEmpty && !value?.length) return this;

        this.query[field] = { $in: value };

        return this;
    }

    addNotInArrayFilter<T extends string | number | boolean | Date>(
        field: string,
        value: T[] | undefined | null,
        options: { ignoreEmpty: boolean } = { ignoreEmpty: true },
    ): this {
        if (this.shouldIgnore(value)) return this;

        if (options.ignoreEmpty && !value?.length) return this;

        this.query[field] = { $nin: value };

        return this;
    }

    addRangeFilter<T extends number | string | Date>(
        field: string,
        value: { start?: T | null; end?: T | null } | undefined | null,
    ): this {
        if (this.shouldIgnore(value)) return this;

        if (!value?.start && !value?.end) return this;

        this.query[field] = {};

        if (value?.start) {
            this.query[field].$gte = value.start;
        }

        if (value?.end) {
            this.query[field].$lte = value.end;
        }

        return this;
    }

    addOrFilter(count: number, aggregator: (conditions: QueryBuilder[]) => void): this {
        const conditions = new Array<QueryBuilder>(count);

        for (let i = 0; i < count; i++) {
            conditions[i] = QueryBuilder.aBuilder();
        }

        aggregator(conditions);

        const filtersArr = conditions.map(c => c.build()).filter(c => Object.keys(c).length !== 0);

        if (!filtersArr.length) return this;

        this.query.$or = Array.isArray(this.query.$or)
            ? [...this.query.$or, ...filtersArr]
            : [...filtersArr];

        return this;
    }

    addAndFilter(count: number, aggregator: (conditions: QueryBuilder[]) => void): this {
        const conditions = new Array<QueryBuilder>(count);

        for (let i = 0; i < count; i++) {
            conditions[i] = QueryBuilder.aBuilder();
        }

        aggregator(conditions);

        const filtersArr = conditions.map(c => c.build()).filter(c => Object.keys(c).length !== 0);

        if (!filtersArr.length) return this;

        this.query.$and = Array.isArray(this.query.$and)
            ? [...this.query.$and, ...filtersArr]
            : [...filtersArr];

        return this;
    }

    addRegexSearch(
        field: string,
        value: string | RegExp | undefined | null,
        options?: {
            caseInsensitive?: boolean;
            multilineIgnore?: boolean;
            ignoreWhiteSpaces?: boolean;
            includeNewLineInDotMatches?: boolean;
        },
    ): this {
        if (this.shouldIgnore(value)) return this;

        let $options: string = '';

        if (options?.caseInsensitive) $options += 'i';
        if (options?.multilineIgnore) $options += 'm';
        if (options?.includeNewLineInDotMatches) $options += 's';
        if (options?.ignoreWhiteSpaces) $options += 'x';

        if (typeof value === 'string') {
            value = escapeRegex(value); // Escape special regex characters in the string
        }

        if ($options) this.query[field] = { $regex: value!, $options };
        else this.query[field] = { $regex: value! };

        return this;
    }

    build(): Record<string, any> {
        return { ...this.query };
    }

    private shouldIgnore(
        value: any,
        option: { ignoreEmptyString: boolean } = { ignoreEmptyString: true },
    ): boolean {
        return (
            this.isNullOrUndefined(value) || (option.ignoreEmptyString && this.isEmptyString(value))
        );
    }

    private isEmptyString(value: any): boolean {
        return typeof value === 'string' && !value.trim();
    }

    private isNullOrUndefined(value: any): boolean {
        if (value === null || value === undefined) return true;
        return false;
    }
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export { QueryBuilder };
