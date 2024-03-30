import path from 'path';

import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

import { Persistence } from './persistence';
import { RedisPersistence } from './redis-persistence';
import { MongodbPersistence } from './mongodb-persistence';
import { PersistenceInitializer } from './persistence-initializer';

import { JobsScheduler } from '../../jobs-scheduler/main/jobs-scheduler';

const PersistenceFactory = {
    async Setup(scheduler: JobsScheduler): Promise<void> {
        for (const persistence of this.Instances()) {
            await PersistenceInitializer.Init(scheduler, persistence);
        }
    },

    async Destroy(): Promise<void> {
        for (const persistence of this.Instances()) {
            await persistence.disconnect();
        }
    },

    Instances(): Persistence[] {
        return [this.aMongoDbPersistence(), this.aRedisPersistence()];
    },

    aMongoDbPersistence(): MongodbPersistence {
        if (!process.env.MONGODB_URI)
            throw new DeveloperException(
                'MISSING_ENV_VARIABLES',
                'should have MONGODB_URI in the env',
            );

        return MongodbPersistence.Instance({
            uri: process.env.MONGODB_URI,
            backupDir: path.join(__dirname, '../../../../storage/db-backups'),
        });
    },

    aRedisPersistence(): RedisPersistence {
        if (!process.env.REDIS_URL)
            throw new DeveloperException(
                'MISSING_ENV_VARIABLES',
                'should have REDIS_URL in the env',
            );

        return RedisPersistence.Instance({ url: process.env.REDIS_URL });
    },
};

export { PersistenceFactory };
