import * as crypto from 'crypto';

import { Day } from '@lib/primitives/generic/types/day';

import { JobsScheduler, Rhythm, ScheduledJob } from './jobs-scheduler';

interface Config {
    disabled: boolean;
}

class InMemoryJobsScheduler implements JobsScheduler {
    private readonly jobsIntervals: NodeJS.Timeout[] = [];
    private readonly jobsTimeouts: NodeJS.Timeout[] = [];

    private static _instance: InMemoryJobsScheduler;

    static Instance(config: Config): InMemoryJobsScheduler {
        if (this._instance) return this._instance;

        this._instance = new InMemoryJobsScheduler(config);

        return this._instance;
    }

    private constructor(private readonly config: Config) {}

    register(job: ScheduledJob): void {
        if (this.config.disabled) return;

        const { interval, executeAfter } = this.parseRhythm(job.rhythm());

        const timeout = setTimeout((): void => {
            const runner = (): void => {
                const correlationId = crypto.randomUUID();

                job.run({ session: { correlationId } })
                    .catch(async () => await job.run({ session: { correlationId } }))
                    .catch(async () => await job.run({ session: { correlationId } }))
                    .catch(e => {});
            };

            runner(); // Run job immediately for the first time to avoid waiting for the first interval

            const ref = setInterval(runner, interval);

            this.jobsIntervals.push(ref);
        }, executeAfter);

        this.jobsTimeouts.push(timeout);
    }

    clearJobs(): void {
        this.jobsIntervals.map(ref => clearInterval(ref));
        this.jobsTimeouts.map(ref => clearTimeout(ref));
    }

    private parseRhythm(rhythm: Rhythm): { interval: number; executeAfter: number } {
        const executionFrequency = this.parseExecutionFrequency(rhythm);
        const executionTimeout = this.calculateFirstExecutionTimeout(rhythm);

        return {
            executeAfter: executionTimeout,
            interval: this.toMilliseconds(
                executionFrequency.hours,
                executionFrequency.minutes,
                executionFrequency.seconds,
            ),
        };
    }

    private parseExecutionFrequency(rhythm: Rhythm): {
        hours: number;
        minutes: number;
        seconds: number;
    } {
        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        if (rhythm.frequency === 'everyMinute') minutes = 1;
        else if (rhythm.frequency === 'everyHour') hours = 1;
        else if (rhythm.frequency === 'everyDay') hours = 24;
        else if (rhythm.frequency === 'everyWeek') hours = 24 * 7;
        else if (rhythm.frequency === 'custom') {
            const intervalElements = rhythm.interval.replace('every ', '').split(' ');

            intervalElements.forEach(value => {
                if (value.includes('s')) seconds = parseInt(value.replace('s', ''));
                if (value.includes('m')) minutes = parseInt(value.replace('m', ''));
                if (value.includes('h')) hours = parseInt(value.replace('h', ''));
            });
        }

        return { hours, minutes, seconds };
    }

    private calculateFirstExecutionTimeout(rhythm: Rhythm): number {
        const executionTime = this.parseFirstExecutionTime(rhythm);
        const daysToExecute = this.parseFirstExecutionDay(rhythm);

        if (!executionTime && !daysToExecute) return 0;

        const now = new Date();

        const firstExecutionDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            daysToExecute ? now.getDate() + daysToExecute : now.getDate(),
            executionTime ? executionTime.hours : 0,
            executionTime ? executionTime.minutes : 0,
        );

        if (firstExecutionDate.getTime() - now.getTime() < 0)
            firstExecutionDate.setHours(firstExecutionDate.getHours() + 24);

        return firstExecutionDate.getTime() - now.getTime();
    }

    private parseFirstExecutionTime(
        rhythm: Rhythm,
    ): { hours: number; minutes: number } | undefined {
        if (!rhythm.firstExecutionTime) return undefined;

        const [hoursString, minutesString] = rhythm.firstExecutionTime.split(':');

        return { hours: parseInt(hoursString), minutes: parseInt(minutesString) };
    }

    private parseFirstExecutionDay(rhythm: Rhythm): number | undefined {
        if (!rhythm.firstExecutionDay) return undefined;

        const map: Record<Day, number> = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        };

        const executionDayIndex = map[rhythm.firstExecutionDay];

        const todayIndex = new Date().getDay();

        const diff = executionDayIndex - todayIndex;

        if (diff > 0) return diff;
        else if (diff < 0) return diff + 7;
        else return 0;
    }

    private toMilliseconds(hours: number, minutes: number, seconds: number): number {
        return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
    }
}

export { InMemoryJobsScheduler };
