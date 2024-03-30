import { PersistenceFactory } from './persistence-factory';

function Transactional(): (
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor,
) => PropertyDescriptor {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            return await PersistenceFactory.aMongoDbPersistence().transaction(async () => {
                let result = originalMethod.apply(this, args);

                if (result instanceof Promise) {
                    result = await result;
                }

                return result;
            });
        };

        return descriptor;
    };
}

export { Transactional };
