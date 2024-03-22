import { wait } from './wait';

interface Options {
    retries?: number;
    delay?: number;
}

const retry = async <T>(fn: () => Promise<T>, options?: Options): Promise<T> => {
    const { delay = 1000, retries = 3 } = options ?? {};

    if (retries === 1) return await fn();

    try {
        return await fn();
    } catch (e) {
        await wait(delay);

        return await retry(fn, { retries: retries - 1, delay });
    }
};

function Retry(
    options?: Options,
): (target: any, methodName: string, descriptor: PropertyDescriptor) => PropertyDescriptor {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            return await retry(async () => {
                const result = originalMethod.apply(this, args);

                if (result instanceof Promise) {
                    return await result;
                }

                return result;
            }, options);
        };

        return descriptor;
    };
}

export { retry, Retry };
