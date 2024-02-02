import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Capitalize } from './capitalize';

await describe('capitalize', async () => {
    await it('should capitalize all the words in a string', () => {
        assert.equal(Capitalize('hello world'), 'Hello World');
    });

    await it('should be able to turn everything into lowercase', () => {
        assert.equal(Capitalize('hello woOrld'), 'Hello WoOrld');

        assert.equal(Capitalize('hello woOrld', { toLower: true }), 'Hello Woorld');
    });
});
