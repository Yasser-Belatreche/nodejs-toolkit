import assert from 'node:assert';
import { describe, it } from 'node:test';
import { IsValidHttpUrl } from './is-valid-http-url';

await describe('Is Valid HTTP Url', async () => {
    await it('should detect wrong urls', () => {
        assert.strictEqual(IsValidHttpUrl('test'), false);
        assert.strictEqual(IsValidHttpUrl('htt://google.com'), false);
        assert.strictEqual(IsValidHttpUrl('http://google.com'), true);
        assert.strictEqual(IsValidHttpUrl('https://google.com'), true);
    });

    await it('should be able to detect secure urls when passing the secure option', () => {
        assert.strictEqual(IsValidHttpUrl('http://google.com', { secure: true }), false);
        assert.strictEqual(IsValidHttpUrl('https://google.com', { secure: true }), true);
    });
});
