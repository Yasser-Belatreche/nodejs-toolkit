import * as crypto from 'crypto';

import { LoggerFactory } from './logger-factory';

import { Result } from '@lib/primitives/generic/patterns/result';
import { ApplicationException } from '@lib/primitives/application-specific/exceptions/application-exception';

function Log(
    context: string,
    options?: { saveParams?: false; saveResult?: false; recordTime?: false },
): (target: any, methodName: string, descriptor: PropertyDescriptor) => PropertyDescriptor {
    let correlationId = crypto.randomUUID();

    const { saveParams = true, saveResult = true, recordTime = true } = options ?? {};

    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const paramsPayload: Record<string, any> = {};

            if (saveParams) {
                args.forEach((value, index) => {
                    if (value?.correlationId) correlationId = value.correlationId;

                    paramsPayload[`param-${index + 1}`] = value;
                });
            }

            try {
                const startTime = Date.now();

                await LoggerFactory.anInstance().info({
                    context: `Starting: ${context}`,
                    correlationId,
                    payload: paramsPayload,
                });

                let result = originalMethod.apply(this, args);

                if (result instanceof Promise) {
                    result = await result;
                }

                const endTime = Date.now();
                const resTime = endTime - startTime;

                const resultPayload: Record<string, any> = {};

                if (saveResult) resultPayload.result = result;
                if (recordTime) resultPayload.time = `${resTime}ms`;

                if (result instanceof Result && !result.success()) {
                    const e = result.error();

                    if (e instanceof ApplicationException) {
                        await LoggerFactory.anInstance().error({
                            context: `Failed: ${context}`,
                            correlationId,
                            error: e,
                            payload: e.error,
                        });
                    } else {
                        await LoggerFactory.anInstance().error({
                            context: `Failed: ${context}`,
                            error: e,
                            correlationId,
                            payload: {},
                        });
                    }
                } else {
                    await LoggerFactory.anInstance().info({
                        context: `Success: ${context}`,
                        correlationId,
                        payload: resultPayload,
                    });
                }

                return result;
            } catch (e) {
                if (e instanceof ApplicationException) {
                    await LoggerFactory.anInstance().error({
                        context: `Failed: ${context}`,
                        correlationId,
                        error: e,
                        payload: e.error,
                    });
                } else {
                    await LoggerFactory.anInstance().error({
                        context: `Failed: ${context}`,
                        error: e as Error,
                        correlationId,
                        payload: {},
                    });
                }

                throw e;
            }
        };

        return descriptor;
    };
}

export { Log };
