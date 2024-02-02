import assert from 'node:assert';
import { describe, it, afterEach, mock } from 'node:test';

import { Rhythm, ScheduledJob } from '../main/jobs-scheduler';
import { JobsSchedulerFactory } from '../main/jobs-scheduler-factory';

await describe('Jobs Scheduler', async () => {
    const jobsScheduler = JobsSchedulerFactory.anInstance();

    afterEach(() => {
        jobsScheduler.clearJobs();
    });

    await it('should be able to register a job to be executed in a custom interval', async () => {
        const job = mock.fn();

        class TestJob implements ScheduledJob {
            async run(): Promise<void> {
                job();
            }

            rhythm(): Rhythm {
                const ONE_SECONDS_INTERVAL = 'every 1s';

                return { frequency: 'custom', interval: ONE_SECONDS_INTERVAL };
            }
        }

        jobsScheduler.register(new TestJob());

        await wait(0.1);

        assert.equal(job.mock.callCount(), 1);

        await wait(1.1);

        assert.equal(job.mock.callCount(), 2);

        await wait(1.1);

        assert.equal(job.mock.callCount(), 3);
    });

    await it('should gracefully catch the error without crashing in case the scheduled job throw any exception, and re-try to run it 3 times', async () => {
        const job = mock.fn(async () => {
            throw new Error('An error occurred');
        });

        class TestJob implements ScheduledJob {
            async run(): Promise<void> {
                await job();
            }

            rhythm(): Rhythm {
                const ONE_SECONDS_INTERVAL = 'every 1s';

                return { frequency: 'custom', interval: ONE_SECONDS_INTERVAL };
            }
        }

        jobsScheduler.register(new TestJob());

        await wait(0.1);

        assert.equal(job.mock.callCount(), 3);

        await wait(1.1);

        assert.equal(job.mock.callCount(), 6);
    });

    const wait = async (seconds: number): Promise<void> => {
        return await new Promise(resolve => {
            setTimeout(resolve, seconds * 1000);
        });
    };
});
