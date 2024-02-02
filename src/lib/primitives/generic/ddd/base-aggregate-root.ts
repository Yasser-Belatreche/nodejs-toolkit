import { BaseEntity } from './base-entity';
import { BaseDomainEvent } from './base-domain-event';

abstract class BaseAggregateRoot<E extends BaseDomainEvent<any>, T> extends BaseEntity<T> {
    private readonly events: E[] = [];

    protected pushEvent(event: E): void {
        this.events.push(event);
    }

    protected clearEvents(): void {
        this.events.length = 0;
    }

    protected haveEvent(name: string): boolean {
        return !!this.events.find(event => event.name === name);
    }

    pullDomainEvents(): E[] {
        const events = this.events.slice();

        this.events.length = 0;

        return events;
    }
}

export { BaseAggregateRoot };
