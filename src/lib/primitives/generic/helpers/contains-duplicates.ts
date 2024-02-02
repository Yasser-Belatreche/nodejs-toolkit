import { ValueObject } from '@lib/primitives/generic/patterns/value-object';

const ContainsDuplicates = <T extends ValueObject<any> | string | number>(arr: T[]): boolean => {
    const valuesSoFar: T[] = [];

    for (const elem of arr) {
        if (elem instanceof ValueObject) {
            if (valuesSoFar.some(v => elem.equals(v as ValueObject<any>))) return true;
        } else if (valuesSoFar.includes(elem)) return true;

        valuesSoFar.push(elem);
    }

    return false;
};

export { ContainsDuplicates };
