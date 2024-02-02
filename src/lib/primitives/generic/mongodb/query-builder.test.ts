import assert from 'node:assert';
import { describe, it } from 'node:test';

import { QueryBuilder } from './query-builder';

await describe('MongoDB Query Builder', async () => {
    await it('should be able to pass the first query object in the constructor parameters', () => {
        const initial = {
            test: true,
        };
        const query = QueryBuilder.aBuilder(initial).build();

        assert.deepEqual(query, initial);
    });

    await it('should be able to add optional primitive filters', () => {
        const query = QueryBuilder.aBuilder()
            .addPrimitiveFilter('string', 'hello')
            .addPrimitiveFilter('empty', '')
            .addPrimitiveFilter('bool', false)
            .addPrimitiveFilter('number', 10)
            .addPrimitiveFilter('nest.value', 'hihi')
            .addPrimitiveFilter('undefined', undefined)
            .addPrimitiveFilter('null', null)
            .build();

        assert.deepEqual(query, {
            string: 'hello',
            bool: false,
            number: 10,
            null: null,
            'nest.value': 'hihi',
        });
    });

    await it('should be able to add an optional array filter', () => {
        const query = QueryBuilder.aBuilder()
            .addArrayFilter('key', ['test1', 23, false])
            .addArrayFilter('undefined', undefined)
            .addArrayFilter('null', null)
            .build();

        assert.deepEqual(query, {
            key: { $in: ['test1', 23, false] },
        });
    });

    await it('should be able to add an optional date range filter', () => {
        const range = {
            start: new Date(Date.UTC(2022, 2, 1)),
            end: new Date(Date.UTC(2023, 2, 1)),
        };

        const query = QueryBuilder.aBuilder().addRangeFilter('key', range).build();

        assert.deepEqual(query, {
            key: {
                $gte: range.start,
                $lte: range.end,
            },
        });
    });

    await it('should be able to add an optional regex search filter', () => {
        const query = QueryBuilder.aBuilder()
            .addRegexSearch('string', 'value')
            .addRegexSearch('regex', /value/)
            .addRegexSearch('with-ignore-case', 'value', { caseInsensitive: true })
            .addRegexSearch('with-multiline-ignore', /^d/, { multilineIgnore: true })
            .addRegexSearch('with-dot-match-all', /^.*d/, { includeNewLineInDotMatches: true })
            .addRegexSearch('ignore-white-spaces', /^ {2}sdf {2}sdd/, {
                ignoreWhiteSpaces: true,
            })
            .addRegexSearch('multi-options', /^sdfasdf/, {
                caseInsensitive: true,
                includeNewLineInDotMatches: true,
                ignoreWhiteSpaces: true,
            })
            .addRegexSearch('undefined', undefined)
            .addRegexSearch('null', null)
            .build();

        assert.deepEqual(query, {
            string: { $regex: 'value' },
            regex: { $regex: /value/ },
            'with-ignore-case': { $regex: 'value', $options: 'i' },
            'with-multiline-ignore': { $regex: /^d/, $options: 'm' },
            'with-dot-match-all': { $regex: /^.*d/, $options: 's' },
            'ignore-white-spaces': { $regex: /^ {2}sdf {2}sdd/, $options: 'x' },
            'multi-options': { $regex: /^sdfasdf/, $options: 'isx' },
        });
    });

    await it('when passing a string as a regex search, should add a back slash to the end result to every special regex character so that it does not cound by the regex engine as a part of the regex expression and we match the exact string passed', () => {
        const query = QueryBuilder.aBuilder().addRegexSearch('string', '^ {3} +i *value').build();

        assert.deepEqual(query, {
            string: { $regex: '\\^ \\{3\\} \\+i \\*value' },
        });
    });

    await it('should be able to add an or', () => {
        const query = QueryBuilder.aBuilder()
            .addPrimitiveFilter('string', 'hello')
            .addOrFilter(3, ([builder1, builder2, builder3]) => {
                builder1.addPrimitiveFilter('bool', false).addPrimitiveFilter('number', 10);

                builder2.addPrimitiveFilter('elem', 4);
            })
            .addPrimitiveFilter('nest.value', 'hihi')
            .addOrFilter(1, ([builder]) => {
                builder.addArrayFilter('key', ['test1', 23, false]);
            })
            .build();

        assert.deepEqual(query, {
            string: 'hello',
            'nest.value': 'hihi',
            $or: [{ bool: false, number: 10 }, { elem: 4 }, { key: { $in: ['test1', 23, false] } }],
        });
    });
});
