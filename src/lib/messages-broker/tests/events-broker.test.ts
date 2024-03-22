import assert from 'node:assert';
import { faker } from '@faker-js/faker';
import { wait } from '@lib/primitives/generic/helpers/wait';
import { describe, it, mock, afterEach, Mock } from 'node:test';

import {
    Event,
    EventHandler,
    EventsBroker,
    UniversalEventHandler,
} from '../main/events-broker/events-broker';

import { RabbitmqEventsBroker } from '../main/events-broker/rabbitmq-events-broker';
import { InMemoryEventsBroker } from '../main/events-broker/in-memory-events-broker/in-memory-events-broker';
import { NodeNativeEventsBroker } from '../main/events-broker/in-memory-events-broker/node-native-events-broker';
import { InMemoryFailedEventsRepository } from '../main/events-broker/in-memory-events-broker/data-access/in-memory-failed-events-repository';

await describe('Events Broker', async () => {
    const brokers = [
        InMemoryEventsBroker.Instance(new InMemoryFailedEventsRepository()),
        NodeNativeEventsBroker.Instance(new InMemoryFailedEventsRepository()),
        RabbitmqEventsBroker.Instance({ uri: 'amqp://user:password@localhost', durable: false }),
    ];

    for (const broker of brokers) {
        await describe(broker.constructor.name, async () => {
            await testCasesOn(broker);
        });
    }
});

async function testCasesOn(broker: EventsBroker): Promise<void> {
    afterEach(async () => {
        await broker.clear();
    });

    await it('should be able to subscribe and publish events', async () => {
        const { event, handler, handlerSpy } = getTestInstances();

        await broker.registerEventHandler(handler);

        assert.equal(handlerSpy.mock.callCount(), 0);

        await broker.publish(event, { correlationId: 'test' });

        await wait(50);

        assert.equal(handlerSpy.mock.callCount(), 1);
        assert.deepEqual(handlerSpy.mock.calls[0].arguments, [event.name, event.payload]);
    });

    await it('should be able to register multiple handlers for the same event ', async () => {
        const { event, handler, handlerSpy } = getTestInstances();

        const { handler: handler2, handlerSpy: handlerSpy2 } = getEventHandlerInstance(event.name);

        await broker.registerEventHandler(handler);
        await broker.registerEventHandler(handler2);

        await broker.publish(event, { correlationId: 'test' });

        await wait(50);

        assert.deepEqual(handlerSpy.mock.calls[0].arguments, [event.name, event.payload]);
        assert.deepEqual(handlerSpy2.mock.calls[0].arguments, [event.name, event.payload]);
    });

    await it('should be able to register and publish multiple events without conflicting', async () => {
        const { event, handler, handlerSpy } = getTestInstances();

        const { handler: handler2, event: event2, handlerSpy: handlerSpy2 } = getTestInstances();

        await broker.registerEventHandler(handler);
        await broker.registerEventHandler(handler2);

        await broker.publish(event, { correlationId: 'test' });

        await wait(50);

        assert.equal(handlerSpy.mock.callCount(), 1);
        assert.equal(handlerSpy2.mock.callCount(), 0);

        await broker.publish(event2, { correlationId: 'test' });

        await wait(50);

        assert.equal(handlerSpy2.mock.callCount(), 1);
    });

    await it('should be able to register a handler for all events', async () => {
        const event = getEventInstance();
        const event2 = getEventInstance();

        const handlerSpy = mock.fn();

        class UniversalTestEventHandler extends UniversalEventHandler {
            constructor() {
                super(faker.lorem.sentence());
            }

            async handle(event: Event<any>): Promise<void> {
                handlerSpy();
            }
        }

        await broker.registerUniversalEventHandler(new UniversalTestEventHandler());

        await broker.publish(event, { correlationId: 'test' });

        await wait(50);

        assert.equal(handlerSpy.mock.callCount(), 1);

        await broker.publish(event2, { correlationId: 'test' });

        await wait(50);

        assert.equal(handlerSpy.mock.callCount(), 2);
    });

    await it('in case a handler failed should be able to retry it again until reaching the retries value in the config if the handler keeps on failing', async () => {
        if (!broker.shouldExplicitlyRetryFailedEvents()) return;

        const { event, handler, handlerSpy } = getTestInstances();

        handlerSpy.mock.mockImplementation(() => {
            throw new Error('error');
        });

        await broker.registerEventHandler(handler);

        await broker.publish(event, { correlationId: 'test' });

        await wait(50);

        assert.equal(handlerSpy.mock.callCount(), 1);

        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 2);

        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 3);

        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 4);

        await broker.retryFailedEvents();
        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 4);
    });

    await it('in case a handler fail should be able to retry it again until reaching the retries value in the config if the handler keeps on failing or processing the event successfully', async () => {
        if (!broker.shouldExplicitlyRetryFailedEvents()) return;

        const { event, handler, handlerSpy } = getTestInstances();

        handlerSpy.mock.mockImplementation(() => {
            throw new Error('error');
        });

        await broker.registerEventHandler(handler);

        await broker.publish(event, { correlationId: 'test' });

        await wait(50);

        assert.equal(handlerSpy.mock.callCount(), 1);

        handlerSpy.mock.mockImplementation(() => {});

        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 2);

        await broker.retryFailedEvents();
        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 2);
    });

    await it('in case a universal handler failed should be able to retry it again until reaching the retries value in the config if the handler keeps on failing', async () => {
        if (!broker.shouldExplicitlyRetryFailedEvents()) return;

        const event = getEventInstance();

        const handlerSpy = mock.fn();

        handlerSpy.mock.mockImplementation(() => {
            throw new Error('error');
        });

        class UniversalTestEventHandler extends UniversalEventHandler {
            constructor() {
                super(faker.lorem.sentence());
            }

            async handle(event: Event<any>): Promise<void> {
                handlerSpy();
            }
        }

        await broker.registerUniversalEventHandler(new UniversalTestEventHandler());

        await broker.publish(event, { correlationId: 'test' });

        await wait(50);

        assert.equal(handlerSpy.mock.callCount(), 1);

        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 2);

        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 3);

        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 4);

        await broker.retryFailedEvents();
        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 4);
    });

    await it('in case a universal handler fail should be able to retry it again until reaching the retries value in the config if the handler keeps on failing or processing the event successfully', async () => {
        if (!broker.shouldExplicitlyRetryFailedEvents()) return;

        const event = getEventInstance();

        const handlerSpy = mock.fn();

        handlerSpy.mock.mockImplementation(() => {
            throw new Error('error');
        });

        class UniversalTestEventHandler extends UniversalEventHandler {
            constructor() {
                super(faker.lorem.sentence());
            }

            async handle(event: Event<any>): Promise<void> {
                handlerSpy();
            }
        }

        await broker.registerUniversalEventHandler(new UniversalTestEventHandler());

        await broker.publish(event, { correlationId: 'test' });

        await wait(50);

        assert.equal(handlerSpy.mock.callCount(), 1);

        handlerSpy.mock.mockImplementation(() => {});

        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 2);

        await broker.retryFailedEvents();
        await broker.retryFailedEvents();
        assert.equal(handlerSpy.mock.callCount(), 2);
    });
}

function getTestInstances(eventName?: string): {
    handlerSpy: Mock<(...args: any[]) => undefined>;
    event: Event<any>;
    handler: EventHandler<Event<any>>;
} {
    const event = getEventInstance(eventName);
    const { handler, handlerSpy } = getEventHandlerInstance(event.name);

    return { event, handler, handlerSpy };
}

function getEventInstance(eventName?: string): Event<any> {
    const name = eventName ?? faker.lorem.sentence();

    class TestEvent extends Event<any> {
        readonly name: string;
        readonly payload: { test: string };

        constructor() {
            super();

            this.name = name;
            this.payload = { test: 'test' };
        }
    }

    return new TestEvent();
}

function getEventHandlerInstance(eventName: string): {
    handlerSpy: Mock<(...args: any[]) => undefined>;
    handler: EventHandler<Event<any>>;
} {
    const handlerSpy = mock.fn();

    class TestEventHandler extends EventHandler<Event<any>> {
        eventName(): string {
            return eventName;
        }

        constructor() {
            super(faker.lorem.sentence());
        }

        async handle(event: Event<any>): Promise<void> {
            handlerSpy(event.name, event.payload);
        }
    }

    return { handler: new TestEventHandler(), handlerSpy };
}
