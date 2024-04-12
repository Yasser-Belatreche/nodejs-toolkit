import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

import { RedisClient } from './persistence/main/redis-persistence';
import { MongoSession } from './persistence/main/mongodb-persistence';
import { PersistenceFactory } from './persistence/main/persistence-factory';

import { MessagesBroker } from './messages-broker/main/messages-broker';
import { MessagesBrokerFactory } from './messages-broker/main/messages-broker-factory';

import { JobsScheduler } from './jobs-scheduler/main/jobs-scheduler';
import { JobsSchedulerFactory } from './jobs-scheduler/main/jobs-scheduler-factory';

import { Logger } from './logger/main/logger';
import { LoggerFactory } from './logger/main/logger-factory';

import { Cache } from './cache/main/cache';
import { CacheFactory } from './cache/main/cache-factory';

import { S3Client } from './cloud/aws/aws';
import { AwsFactory } from './cloud/aws/aws-factory';

import { CloudinaryClient } from './cloud/cloudinary/cloudinary';
import { CloudinaryFactory } from './cloud/cloudinary/cloudinary-factory';

const Library = {
    async Init(): Promise<void> {
        await LoggerFactory.Setup(this.aJobsScheduler());
        await PersistenceFactory.Setup(this.aJobsScheduler());
        await MessagesBrokerFactory.Setup(this.aJobsScheduler());
    },

    async Destroy() {
        await PersistenceFactory.Destroy();
    },

    aRedisClient(): RedisClient {
        return PersistenceFactory.aRedisPersistence().Client();
    },

    MongoSession(session: SessionCorrelationId): MongoSession {
        return PersistenceFactory.aMongoDbPersistence().getSession(session);
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

    anAwsS3Client(): S3Client {
        return AwsFactory.anInstance().S3Client();
    },

    aCloudinaryClient(): CloudinaryClient {
        return CloudinaryFactory.anInstance().Client();
    },
};

export { Library };
