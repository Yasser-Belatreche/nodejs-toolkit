abstract class ValueObject<T extends string | number> {
    protected constructor(protected readonly _value: T) {}

    get value(): T {
        return this._value;
    }

    equals(another: this): boolean {
        return another.value === this.value;
    }
}

export { ValueObject };
