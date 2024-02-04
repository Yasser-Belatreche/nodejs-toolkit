import assert from 'node:assert';
import { describe, it, beforeEach, mock } from 'node:test';

import { Event, EventHandler } from '../main/messages-broker';
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

        class TestEventHandler implements EventHandler<TestEvent> {
            eventName = 'TestEvent';

            async handle(event: TestEvent): Promise<void> {
                handler(event.name, event.payload);
            }
        }

        messagesBroker.registerEventHandler(new TestEventHandler());

        assert.equal(handler.mock.callCount(), 0);

        messagesBroker.publish(event, { correlationId: 'test' });

        await wait(0.1);

        assert.equal(handler.mock.callCount(), 1);
        assert.deepEqual(handler.mock.calls[0].arguments, ['TestEvent', event.payload]);
    });

    await it('should be able to register multiple handlers and publish events', async () => {
        const event = new TestEvent();

        const handler = mock.fn();
        const handler2 = mock.fn();

        class TestEventHandler implements EventHandler<TestEvent> {
            eventName = 'TestEvent';

            async handle(event: TestEvent): Promise<void> {
                handler(event.name, event.payload);
            }
        }

        class TestEventHandler2 implements EventHandler<TestEvent> {
            eventName = 'TestEvent';

            async handle(event: TestEvent): Promise<void> {
                handler2(event.name, event.payload);
            }
        }

        messagesBroker.registerEventHandler(new TestEventHandler());
        messagesBroker.registerEventHandler(new TestEventHandler2());

        messagesBroker.publish(event, { correlationId: 'test' });

        await wait(0.1);

        assert.deepEqual(handler.mock.calls[0].arguments, ['TestEvent', event.payload]);
        assert.deepEqual(handler2.mock.calls[0].arguments, ['TestEvent', event.payload]);
    });

    await it('should be able to register and publish multiple events without conflicting', async () => {
        const handler = mock.fn();
        const handler2 = mock.fn();

        class TestEventHandler implements EventHandler<TestEvent> {
            eventName = 'TestEvent';

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

        class TestEventHandler2 implements EventHandler<TestEvent2> {
            eventName = 'TestEvent2';

            async handle(event: TestEvent2): Promise<void> {
                handler2(event.name, event.payload);
            }
        }

        messagesBroker.registerEventHandler(new TestEventHandler());
        messagesBroker.registerEventHandler(new TestEventHandler2());

        const event = new TestEvent();
        messagesBroker.publish(event, { correlationId: 'test' });

        await wait(0.1);

        assert.equal(handler.mock.callCount(), 1);
        assert.equal(handler2.mock.callCount(), 0);

        const event2 = new TestEvent2();
        messagesBroker.publish(event2, { correlationId: 'test' });

        assert.equal(handler2.mock.callCount(), 1);
    });

    await it('in case a handler fail should retry it 3 times and then ignore it', async () => {
        const handler = mock.fn((name: string, payload: any) => {
            throw new Error('error');
        });

        class TestEventHandler implements EventHandler<TestEvent> {
            eventName: string = 'TestEvent';

            async handle(event: TestEvent): Promise<void> {
                handler(event.name, event.payload);
            }
        }

        messagesBroker.registerEventHandler(new TestEventHandler());

        const event = new TestEvent();
        messagesBroker.publish(event, { correlationId: 'test' });

        await wait(0.1);

        assert.equal(handler.mock.callCount(), 3);
    });

    const wait = async (seconds: number): Promise<void> => {
        return await new Promise(resolve => {
            setTimeout(resolve, seconds * 1000);
        });
    };
});
