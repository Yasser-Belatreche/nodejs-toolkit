import { Persistence } from './persistence/main/persistence';
import { PersistenceFactory } from './persistence/main/persistence-factory';

import { MessagesBroker } from './messages-broker/main/messages-broker';
import { MessagesBrokerFactory } from './messages-broker/main/messages-broker-factory';

import { JobsScheduler } from './jobs-scheduler/main/jobs-scheduler';
import { JobsSchedulerFactory } from './jobs-scheduler/main/jobs-scheduler-factory';

import { Logger } from './logger/main/logger';
import { LoggerFactory } from './logger/main/logger-factory';

import { Cache } from './cache/main/cache';
import { CacheFactory } from './cache/main/cache-factory';

const Library = {
    async Init(): Promise<void> {
        await LoggerFactory.Setup(this.aJobsScheduler());
        await PersistenceFactory.Setup(this.aJobsScheduler());
        await MessagesBrokerFactory.Setup(this.aJobsScheduler());
    },

    async Destroy() {
        await PersistenceFactory.Destroy();
    },

    aPersistence(): Persistence {
        return PersistenceFactory.anInstance();
    },

    aMessagesBroker(): MessagesBroker {
        return MessagesBrokerFactory.anInstance();
    },

    aJobsScheduler(): JobsScheduler {
        return JobsSchedulerFactory.anInstance();
    },

    aLogger(): Logger {
        return LoggerFactory.anInstance();
    },

    aCache(): Cache {
        return CacheFactory.anInstance();
    },
};

export { Library };
