/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Primitive } from '../types/primitive';
import { ValueObject } from '../patterns/value-object';

type Param = Primitive | ValueObject<any> | { [key: string]: Param };

const DeepEqual = <T extends Param>(first: T, second: T): boolean => {
    if (typeof first !== typeof second) return false;

    if (isBasePrimitive(first) || isBasePrimitive(second)) return first === second;

    if (first instanceof ValueObject && second instanceof ValueObject) return first.equals(second);

    if (first instanceof Date && second instanceof Date)
        return first.getTime() === second.getTime();

    // @ts-expect-error
    first = first as Record<string, Param>;
    // @ts-expect-error
    second = second as Record<string, Param>;

    const firstKeys = Object.keys(first);
    const secondKeys = Object.keys(second);

    if (firstKeys.length !== secondKeys.length) return false;

    for (const key of firstKeys) {
        if (!secondKeys.includes(key)) return false;

        if (!DeepEqual(first[key], second[key])) return false;
    }

    return true;
};

const isBasePrimitive = (val: any): boolean => {
    return (
        typeof val === 'string' ||
        typeof val === 'number' ||
        typeof val === 'boolean' ||
        val === null ||
        val === undefined
    );
};

export { DeepEqual };
