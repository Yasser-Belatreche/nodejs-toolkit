import { DeveloperException } from '../../application-specific/exceptions/developer-exception';
import { Primitive } from '../types/primitive';

function RemoveDuplicates<T extends Primitive>(array: T[]): T[];

function RemoveDuplicates<T>(array: T[], uniqueKeyExtractor: (item: T) => string): T[];

function RemoveDuplicates<T extends Primitive | Record<string, unknown>>(
    array: T[],
    uniqueKeyExtractor?: (item: T) => string,
): T[] {
    if (!array.length) return array;

    if (typeof array[0] !== 'object') {
        const unique = new Set<T>();

        for (const item of array) {
            unique.add(item);
        }

        return Array.from(unique);
    }

    if (!uniqueKeyExtractor)
        throw new DeveloperException(
            'WRONG_USAGE_OF_REMOVE_DUPLICATES',
            'should pass the unique key extractor function when passing an array of objects',
        );

    const uniqueKeys = new Set<string>();
    const result: T[] = [];

    for (const item of array) {
        if (uniqueKeys.has(uniqueKeyExtractor(item))) continue;

        uniqueKeys.add(uniqueKeyExtractor(item));

        result.push(item);
    }

    return result;
}

export { RemoveDuplicates };
