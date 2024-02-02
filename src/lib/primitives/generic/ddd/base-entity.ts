abstract class BaseEntity<T> {
    protected abstract id: T;

    getIdentity(): T {
        return this.id;
    }

    equals(another: object): boolean {
        return another instanceof BaseEntity && another.id.equals(this.id);
    }
}

export { BaseEntity };
