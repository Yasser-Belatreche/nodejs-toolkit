import { PersistenceFactory } from './persistence-factory';

function Transactional(): (
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor,
) => PropertyDescriptor {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            await PersistenceFactory.anInstance().transaction(async () => {
                await originalMethod.apply(this, args);
            });
        };

        return descriptor;
    };
}

export { Transactional };
