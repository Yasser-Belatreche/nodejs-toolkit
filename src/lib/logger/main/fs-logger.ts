import fs from 'fs';
import os from 'os';
import path from 'path';
import fsPromise from 'node:fs/promises';

import { ErrorLogRequest, InfoLogRequest, Logger, WarningLogRequest } from './logger';

interface Config {
    filePath: string;
    withMemCache: boolean;
    maxLogsInMemoryCache?: number;
}

class FsLogger implements Logger {
    private logsCache: string[] = [];

    private static _instance: FsLogger;

    static Instance(config: Config): FsLogger {
        if (this._instance) return this._instance;

        this._instance = new FsLogger(config);

        return this._instance;
    }

    private constructor(private readonly config: Config) {
        const directoryPath = path.dirname(config.filePath);
        if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath, { recursive: true });
        if (!fs.existsSync(config.filePath))
            fs.writeFileSync(
                config.filePath,
                `START: ${new Date().toISOString()}` + os.EOL + os.EOL,
            );
    }

    async info(log: InfoLogRequest): Promise<void> {
        const date = new Date().toISOString();
        const str = `[${log.correlationId}] - [${date}] - INFO - [${log.context}] - data: ${JSON.stringify(log.payload) ?? {}}`;

        await this.append(str);
    }

    async error(log: ErrorLogRequest): Promise<void> {
        const date = new Date().toISOString();
        const errorRelated = `error: ${log.error.name} (${log.error.message}) - stack: ${
            log.error.stack?.replace(RegExp(os.EOL, 'g'), ' ') ?? 'NO STACK'
        }`;

        const str = `[${log.correlationId}] - [${date}] - ERROR - [${log.context}] - ${errorRelated} - data: ${JSON.stringify(log.payload) ?? {}}`;

        await this.append(str);
    }

    async warn(log: WarningLogRequest): Promise<void> {
        const date = new Date().toISOString();
        const errorRelated = log.error
            ? `error: ${log.error.name} (${log.error.message}) - stack: ${
                  log.error.stack?.replace(RegExp(os.EOL, 'g'), ' ') ?? 'NO STACK'
              }`
            : 'error: NO ERROR';

        const str = `[${log.correlationId}] - [${date}] - WARNING - [${log.context}] - ${errorRelated} - data: ${JSON.stringify(log.payload) ?? {}}`;

        await this.append(str);
    }

    async clear(options?: { saveOld?: boolean }): Promise<void> {
        const date = new Date().toISOString();

        if (!options?.saveOld) {
            this.logsCache = [];
            await fsPromise.writeFile(this.config.filePath, `START: ${date}` + os.EOL + os.EOL);

            return;
        }

        await this.commitCache();

        const directoryPath = path.dirname(this.config.filePath);

        await fsPromise.appendFile(this.config.filePath, `END: ${date}` + os.EOL);
        await fsPromise.copyFile(
            this.config.filePath,
            path.join(directoryPath, `SAVED-AT-${date}.log`),
        );

        await fsPromise.writeFile(this.config.filePath, `START: ${date}` + os.EOL + os.EOL);
    }

    private async append(str: string): Promise<void> {
        try {
            if (!this.config.withMemCache)
                return await fsPromise.appendFile(this.config.filePath, str + os.EOL);

            this.logsCache.push(str);

            if (this.logsCache.length === (this.config.maxLogsInMemoryCache ?? 1000)) {
                await this.commitCache();
            }
        } catch {
            console.log(str);
        }
    }

    private async commitCache(): Promise<void> {
        await fsPromise.appendFile(this.config.filePath, this.logsCache.join(os.EOL) + os.EOL);

        this.logsCache = [];
    }
}

export { FsLogger };
