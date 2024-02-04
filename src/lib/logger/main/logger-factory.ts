import path from 'path';

import { JobsScheduler } from '../../jobs-scheduler/main/jobs-scheduler';

import { Logger } from './logger';
import { FsLogger } from './fs-logger';
import { LoggerInitializer } from './logger-initializer';

const filePath = path.join(__dirname, '../../../../outputs/logs/app.log');
const logger = FsLogger.Instance({ filePath, withMemCache: false });

const LoggerFactory = {
    async Setup(scheduler: JobsScheduler): Promise<void> {
        LoggerInitializer.Init(scheduler, logger);
    },

    anInstance(): Logger {
        return logger;
    },
};

export { LoggerFactory };
