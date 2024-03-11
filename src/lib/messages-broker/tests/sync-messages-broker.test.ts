import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

import { Answer, SyncMessagesBroker } from '../main/sync-messages-broker/sync-messages-broker';
import { InMemorySyncMessagesBroker } from '../main/sync-messages-broker/in-memory-sync-messages-broker';

await describe('Sync Messages Broker', async () => {
    const brokers: SyncMessagesBroker[] = [InMemorySyncMessagesBroker.Instance()];

    for (const broker of brokers) {
        await describe(broker.constructor.name, async () => {
            await testCasesOn(broker);
        });
    }
});

async function testCasesOn(broker: SyncMessagesBroker): Promise<void> {
    beforeEach(() => {
        broker.clear();
    });

    await it('should be able to register an answer for a question and get that answer when asking the same question', async () => {
        class TestAnswer implements Answer<'Tests.First'> {
            question(): 'Tests.First' {
                return 'Tests.First';
            }

            async answer(params: { trackingId: string }): Promise<number> {
                return 42;
            }
        }

        broker.registerAnswer(new TestAnswer());

        const result = await broker.ask(
            'Tests.First',
            { trackingId: 'hello' },
            { correlationId: 'test' },
        );

        assert.equal(result, 42);
    });

    await it('should not be able to register multiple answers to the same question', async () => {
        class TestAnswer implements Answer<'Tests.First'> {
            question(): 'Tests.First' {
                return 'Tests.First';
            }

            async answer(params: { trackingId: string }): Promise<number> {
                return 42;
            }
        }

        class TestAnswer2 implements Answer<'Tests.First'> {
            question(): 'Tests.First' {
                return 'Tests.First';
            }

            async answer(params: { trackingId: string }): Promise<number> {
                return 42;
            }
        }

        broker.registerAnswer(new TestAnswer());

        try {
            broker.registerAnswer(new TestAnswer2());
            assert.fail('Should not be able to register multiple answers to the same question');
        } catch (e) {
            assert.equal(
                e instanceof Error && e.message,
                'There is already an answer registered for the question: Tests.First',
            );
        }
    });

    await it('should throw and error when asking a question that has no answer registered', async () => {
        try {
            await broker.ask('Tests.First', { trackingId: 'test' }, { correlationId: 'test' });
            assert.fail(
                'Should throw an error when asking a question that has no answer registered',
            );
        } catch (e) {
            assert.equal(
                e instanceof Error && e.message,
                `There is no answer registered for the question: Tests.First`,
            );
        }
    });

    await it('should be able to register multiple answers to different questions', async () => {
        class TestAnswer1 implements Answer<'Tests.First'> {
            question(): 'Tests.First' {
                return 'Tests.First';
            }

            async answer(params: { trackingId: string }): Promise<number> {
                return 32;
            }
        }

        class TestAnswer2 implements Answer<'Tests.Second'> {
            question(): 'Tests.Second' {
                return 'Tests.Second';
            }

            async answer(params: { something: string }): Promise<boolean> {
                return true;
            }
        }

        broker.registerAnswer(new TestAnswer1());
        broker.registerAnswer(new TestAnswer2());

        const result1 = await broker.ask(
            'Tests.First',
            { trackingId: 'test' },
            { correlationId: 'test' },
        );
        const result2 = await broker.ask(
            'Tests.Second',
            { something: 'something' },
            { correlationId: 'test' },
        );

        assert.equal(result1, 32);
        assert.equal(result2, true);
    });
}
