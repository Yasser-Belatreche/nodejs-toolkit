import { DeepEqual } from '../helpers/deep-equal';
import { Primitive } from '../types/primitive';

abstract class ValueObject<T extends Primitive | Record<string, Primitive>> {
    protected constructor(protected readonly _value: T) {}

    get value(): T {
        return this._value;
    }

    equals(another: ValueObject<T>): boolean {
        return DeepEqual(this.value, another.value);
    }
}

export { ValueObject };
