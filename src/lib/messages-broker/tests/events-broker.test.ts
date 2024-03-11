import assert from 'node:assert';
import { describe, it, beforeEach, mock } from 'node:test';

import {
    Event,
    EventHandler,
    EventsBroker,
    UniversalEventHandler,
} from '../main/events-broker/events-broker';
import { InMemoryEventsBroker } from '../main/events-broker/in-memory-events-broker/in-memory-events-broker';
import { InMemoryFailedEventsRepository } from '../main/events-broker/in-memory-events-broker/data-access/in-memory-failed-events-repository';
import { NodeNativeEventsBroker } from '../main/events-broker/in-memory-events-broker/node-native-events-broker';

await describe('Events Broker', async () => {
    const brokers = [
        InMemoryEventsBroker.Instance(new InMemoryFailedEventsRepository()),
        NodeNativeEventsBroker.Instance(new InMemoryFailedEventsRepository()),
    ];

    for (const broker of brokers) {
        await describe(broker.constructor.name, async () => {
            await testCasesOn(broker);
        });
    }
});

async function testCasesOn(broker: EventsBroker): Promise<void> {
    const handler = mock.fn();

    beforeEach(() => {
        handler.mock.resetCalls();

        broker.clear();
    });

    class TestEvent extends Event<any> {
        readonly name: string;
        readonly payload: { test: string };

        constructor() {
            super();

            this.name = 'TestEvent';
            this.payload = { test: 'test' };
        }
    }

    class TestEventHandler extends EventHandler<TestEvent> {
        eventName(): string {
            return 'TestEvent';
        }

        config(): { readonly retries: number } {
            return { retries: 3 };
        }

        constructor() {
            super('TestComponent');
        }

        async handle(event: TestEvent): Promise<void> {
            handler(event.name, event.payload);
        }
    }
    await it('should be able to subscribe and publish events', async () => {
        const event = new TestEvent();

        broker.registerEventHandler(new TestEventHandler());

        assert.equal(handler.mock.callCount(), 0);

        await broker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);
        assert.deepEqual(handler.mock.calls[0].arguments, ['TestEvent', event.payload]);
    });

    await it('should be able to register multiple handlers and publish events', async () => {
        const event = new TestEvent();

        const handler2 = mock.fn();

        class TestEventHandler2 extends EventHandler<TestEvent> {
            eventName(): string {
                return 'TestEvent';
            }

            config(): { readonly retries: number } {
                return { retries: 3 };
            }

            constructor() {
                super('TestComponent');
            }

            async handle(event: TestEvent): Promise<void> {
                handler2(event.name, event.payload);
            }
        }

        broker.registerEventHandler(new TestEventHandler());
        broker.registerEventHandler(new TestEventHandler2());

        await broker.publish(event, { correlationId: 'test' });

        assert.deepEqual(handler.mock.calls[0].arguments, ['TestEvent', event.payload]);
        assert.deepEqual(handler2.mock.calls[0].arguments, ['TestEvent', event.payload]);
    });

    await it('should be able to register and publish multiple events without conflicting', async () => {
        const handler2 = mock.fn();

        class TestEvent2 extends Event<any> {
            readonly name: string;
            readonly payload: { test: string };

            constructor() {
                super();

                this.name = 'TestEvent2';
                this.payload = { test: 'test2' };
            }
        }

        class TestEventHandler2 extends EventHandler<TestEvent2> {
            eventName(): string {
                return 'TestEvent2';
            }

            config(): { readonly retries: number } {
                return { retries: 3 };
            }

            constructor() {
                super('TestComponent');
            }

            async handle(event: TestEvent2): Promise<void> {
                handler2(event.name, event.payload);
            }
        }

        broker.registerEventHandler(new TestEventHandler());
        broker.registerEventHandler(new TestEventHandler2());

        const event = new TestEvent();
        await broker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);
        assert.equal(handler2.mock.callCount(), 0);

        const event2 = new TestEvent2();
        await broker.publish(event2, { correlationId: 'test' });

        assert.equal(handler2.mock.callCount(), 1);
    });

    await it('should be able to register a handler for all events', async () => {
        class UniversalTestEventHandler extends UniversalEventHandler {
            config(): { readonly retries: number } {
                return { retries: 3 };
            }

            constructor() {
                super('TestComponent');
            }

            async handle(event: TestEvent): Promise<void> {
                handler(event.name, event.payload);
            }
        }

        class TestEvent2 extends Event<any> {
            readonly name: string;
            readonly payload: { test: string };

            constructor() {
                super();

                this.name = 'TestEvent2';
                this.payload = { test: 'test2' };
            }
        }

        const event = new TestEvent();
        const event2 = new TestEvent2();

        broker.registerUniversalEventHandler(new UniversalTestEventHandler());

        await broker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);

        await broker.publish(event2, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 2);
    });

    await it('in case a handler failed should be able to retry it again until reaching the retries value in the config if the handler keeps on failing', async () => {
        if (!broker.shouldExplicitlyRetryFailedEvents()) return;

        handler.mock.mockImplementation(() => {
            throw new Error('error');
        });

        broker.registerEventHandler(new TestEventHandler());

        const event = new TestEvent();
        await broker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);

        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 2);

        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 3);

        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 4);

        await broker.retryFailedEvents();
        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 4);
    });

    await it('in case a handler fail should be able to retry it again until reaching the retries value in the config if the handler keeps on failing or processing the event successfully', async () => {
        if (!broker.shouldExplicitlyRetryFailedEvents()) return;

        handler.mock.mockImplementation(() => {
            throw new Error('error');
        });

        broker.registerEventHandler(new TestEventHandler());

        const event = new TestEvent();
        await broker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);

        handler.mock.mockImplementation(() => {});

        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 2);

        await broker.retryFailedEvents();
        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 2);
    });

    await it('in case a universal handler failed should be able to retry it again until reaching the retries value in the config if the handler keeps on failing', async () => {
        if (!broker.shouldExplicitlyRetryFailedEvents()) return;

        class UniversalTestEventHandler extends UniversalEventHandler {
            config(): { readonly retries: number } {
                return { retries: 3 };
            }

            constructor() {
                super('TestComponent');
            }

            async handle(event: TestEvent): Promise<void> {
                handler(event.name, event.payload);
            }
        }

        handler.mock.mockImplementation(() => {
            throw new Error('error');
        });

        broker.registerUniversalEventHandler(new UniversalTestEventHandler());

        const event = new TestEvent();
        await broker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);

        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 2);

        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 3);

        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 4);

        await broker.retryFailedEvents();
        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 4);
    });

    await it('in case a universal handler fail should be able to retry it again until reaching the retries value in the config if the handler keeps on failing or processing the event successfully', async () => {
        if (!broker.shouldExplicitlyRetryFailedEvents()) return;

        class UniversalTestEventHandler extends UniversalEventHandler {
            config(): { readonly retries: number } {
                return { retries: 3 };
            }

            constructor() {
                super('TestComponent');
            }

            async handle(event: TestEvent): Promise<void> {
                handler(event.name, event.payload);
            }
        }

        handler.mock.mockImplementation(() => {
            throw new Error('error');
        });

        broker.registerUniversalEventHandler(new UniversalTestEventHandler());

        const event = new TestEvent();
        await broker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);

        handler.mock.mockImplementation(() => {});

        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 2);

        await broker.retryFailedEvents();
        await broker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 2);
    });
}
