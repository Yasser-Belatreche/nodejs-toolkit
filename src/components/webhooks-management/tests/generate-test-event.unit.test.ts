import assert from 'node:assert';
import { describe, it } from 'node:test';
import { GenerateTestEvent } from '../main/core/domain/supported-events';

await describe('generate test event', async () => {
    await it('should generate a correct test event following the documentation', async () => {
        const event = GenerateTestEvent({
            eventId: '[STRING] represent the event id',
            occurredAt: '[ISO_STRING_DATE] represent the event occurred at',
            name: '[STRING] represent the event name',
            payload: {
                testAttribute: '[STRING] represent the some arbitrary data',
                arrayAttribute: '[STRING (ARRAY)] represent the some arbitrary data',
                intArrayAttribute: '[NUMBER (ARRAY)] represent the some arbitrary data',
                intAttribute: '[NUMBER] represent the some arbitrary data',
                boolAttribute: '[BOOLEAN] represent the some arbitrary data',
                nullableAttribute: '[STRING (NULLABLE)] represent the some arbitrary data',
                optionalAttribute: '[STRING (OPTIONAL)] represent the some arbitrary data',
                objectAttribute: {
                    nestedAttribute: '[STRING] represent the some arbitrary data',
                    nestedObjectsArray: [
                        {
                            nestedAttribute: '[STRING] represent the some arbitrary data',
                        },
                    ],
                },
            },
        });

        assert.equal(typeof event.eventId, 'string');
        assert.equal(event.occurredAt instanceof Date, true);
        assert.equal(typeof event.name, 'string');
        assert.equal(typeof event.payload.testAttribute, 'string');
        assert.equal(Array.isArray(event.payload.arrayAttribute), true);
        assert.equal(typeof event.payload.arrayAttribute[0], 'string');
        assert.equal(Array.isArray(event.payload.intArrayAttribute), true);
        assert.equal(typeof event.payload.intArrayAttribute[0], 'number');
        assert.equal(typeof event.payload.intAttribute, 'number');
        assert.equal(typeof event.payload.boolAttribute, 'boolean');
        assert.ok(
            typeof event.payload.nullableAttribute === 'string' ||
                event.payload.nullableAttribute === null,
        );
        assert.ok(
            typeof event.payload.optionalAttribute === 'string' ||
                event.payload.optionalAttribute === undefined,
        );
        assert.equal(typeof event.payload.objectAttribute.nestedAttribute, 'string');

        assert.equal(
            typeof event.payload.objectAttribute.nestedObjectsArray[0].nestedAttribute,
            'string',
        );
    });
});
