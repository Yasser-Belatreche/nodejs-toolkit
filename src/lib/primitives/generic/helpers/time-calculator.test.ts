import assert from 'node:assert';
import { describe, it } from 'node:test';

import { TimeCalculator } from './time-calculator';

await describe('time calculator', async () => {
    await it('should be able to calculate time in milliseconds', () => {
        assert.equal(
            TimeCalculator.Instance().days(1).hours(4).minutes(10).inMilliseconds(),
            1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000 + 10 * 60 * 1000,
        );
    });

    await it('should be able to calculate time in seconds', () => {
        assert.equal(
            TimeCalculator.Instance().days(1).hours(4).minutes(10).inSeconds(),
            1 * 24 * 60 * 60 + 4 * 60 * 60 + 10 * 60,
        );
    });

    await it('should be able to calculate time in minutes', () => {
        assert.equal(
            TimeCalculator.Instance().days(1).hours(4).minutes(10).inMinutes(),
            1 * 24 * 60 + 4 * 60 + 10,
        );
    });

    await it('should be able to calculate time in hours', () => {
        assert.equal(
            TimeCalculator.Instance().days(1).hours(4).minutes(10).inHours(),
            1 * 24 + 4 + 10 / 60,
        );
    });
});
