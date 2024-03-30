import path from 'path';

import { JobsScheduler } from '../../jobs-scheduler/main/jobs-scheduler';

import { Logger } from './logger';
import { FsLogger } from './fs-logger';
import { LoggerInitializer } from './logger-initializer';

const LoggerFactory = {
    async Setup(scheduler: JobsScheduler): Promise<void> {
        LoggerInitializer.Init(scheduler, this.anInstance());
    },

    anInstance(): Logger {
        const filePath = path.join(__dirname, '../../../../storage/logs/app.log');
        const logger = FsLogger.Instance({ filePath, withMemCache: false });

        return logger;
    },
};

export { LoggerFactory };
