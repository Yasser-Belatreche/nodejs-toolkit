import assert from 'node:assert';
import { describe, it, beforeEach, mock } from 'node:test';

import { Event, EventHandler, UniversalEventHandler } from '../main/messages-broker';
import { MessagesBrokerFactory } from '../main/messages-broker-factory';

await describe('Events Publish/Subscribe', async () => {
    const messagesBroker = MessagesBrokerFactory.anInstance();

    beforeEach(() => {
        messagesBroker.clear();
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

    await it('should be able to subscribe and publish events', async () => {
        const event = new TestEvent();
        const handler = mock.fn();

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

        messagesBroker.registerEventHandler(new TestEventHandler());

        assert.equal(handler.mock.callCount(), 0);

        await messagesBroker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);
        assert.deepEqual(handler.mock.calls[0].arguments, ['TestEvent', event.payload]);
    });

    await it('should be able to register multiple handlers and publish events', async () => {
        const event = new TestEvent();

        const handler = mock.fn();
        const handler2 = mock.fn();

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

        messagesBroker.registerEventHandler(new TestEventHandler());
        messagesBroker.registerEventHandler(new TestEventHandler2());

        await messagesBroker.publish(event, { correlationId: 'test' });

        assert.deepEqual(handler.mock.calls[0].arguments, ['TestEvent', event.payload]);
        assert.deepEqual(handler2.mock.calls[0].arguments, ['TestEvent', event.payload]);
    });

    await it('should be able to register and publish multiple events without conflicting', async () => {
        const handler = mock.fn();
        const handler2 = mock.fn();

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

        messagesBroker.registerEventHandler(new TestEventHandler());
        messagesBroker.registerEventHandler(new TestEventHandler2());

        const event = new TestEvent();
        await messagesBroker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);
        assert.equal(handler2.mock.callCount(), 0);

        const event2 = new TestEvent2();
        await messagesBroker.publish(event2, { correlationId: 'test' });

        assert.equal(handler2.mock.callCount(), 1);
    });

    await it('should be able to register a handler for all events', async () => {
        const handler = mock.fn();

        class TestEventHandler extends UniversalEventHandler {
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

        messagesBroker.registerUniversalEventHandler(new TestEventHandler());

        await messagesBroker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);

        await messagesBroker.publish(event2, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 2);
    });

    await it('in case a handler fail should be able to retry it again until reaching the retries value in the config if the handler keeps on failing', async () => {
        const handler = mock.fn((name: string, payload: any) => {
            throw new Error('error');
        });

        class TestEventHandler extends EventHandler<TestEvent> {
            eventName(): string {
                return 'TestEvent';
            }

            config(): { readonly retries: number } {
                return { retries: 2 };
            }

            constructor() {
                super('TestComponent');
            }

            async handle(event: TestEvent): Promise<void> {
                handler(event.name, event.payload);
            }
        }

        messagesBroker.registerEventHandler(new TestEventHandler());

        const event = new TestEvent();
        await messagesBroker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);

        await messagesBroker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 2);

        await messagesBroker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 3);

        await messagesBroker.retryFailedEvents();
        await messagesBroker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 3);
    });

    await it('in case a handler fail should be able to retry it again until reaching the retries value in the config if the handler keeps on failing or processing the event successfully', async () => {
        const handler = mock.fn((name: string, payload: any) => {
            throw new Error('error');
        });

        class TestEventHandler extends EventHandler<TestEvent> {
            eventName(): string {
                return 'TestEvent';
            }

            config(): { readonly retries: number } {
                return { retries: 2 };
            }

            constructor() {
                super('TestComponent');
            }

            async handle(event: TestEvent): Promise<void> {
                handler(event.name, event.payload);
            }
        }

        messagesBroker.registerEventHandler(new TestEventHandler());

        const event = new TestEvent();
        await messagesBroker.publish(event, { correlationId: 'test' });

        assert.equal(handler.mock.callCount(), 1);

        handler.mock.mockImplementation(() => {});

        await messagesBroker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 2);

        await messagesBroker.retryFailedEvents();
        await messagesBroker.retryFailedEvents();
        assert.equal(handler.mock.callCount(), 2);
    });
});
