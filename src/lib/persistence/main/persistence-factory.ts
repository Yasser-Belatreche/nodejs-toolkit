import path from 'path';

import { Persistence } from './persistence';

import { JobsScheduler } from '../../jobs-scheduler/main/jobs-scheduler';

import { MongodbPersistence } from './mongodb-persistence';
import { PersistenceInitializer } from './persistence-initializer';
import { DeveloperException } from '../../primitives/application-specific/exceptions/developer-exception';

const PersistenceFactory = {
    async Setup(scheduler: JobsScheduler): Promise<void> {
        await PersistenceInitializer.Init(scheduler, this.anInstance());
    },

    async Destroy(): Promise<void> {
        await this.anInstance().disconnect();
    },

    anInstance(): Persistence {
        if (!process.env.MONGODB_URI)
            throw new DeveloperException(
                'MISSING_ENV_VARIABLES',
                'should have MONGODB_URI in the env',
            );

        return MongodbPersistence.Instance({
            uri: process.env.MONGODB_URI,
            backupDir: path.join(__dirname, '../../../../outputs/db-backups'),
        });
    },
};

export { PersistenceFactory };
