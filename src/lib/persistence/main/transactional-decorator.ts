import { SessionCorrelationId } from '@lib/primitives/application-specific/session';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

import { PersistenceFactory } from './persistence-factory';

function Transactional(): (
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor,
) => PropertyDescriptor {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            let session: SessionCorrelationId | undefined;

            for (const argument of args) {
                if (argument?.correlationId) {
                    session = { correlationId: argument.correlationId };
                    break;
                }

                if (argument?.session) {
                    session = argument.session;
                    break;
                }
            }

            if (!session)
                throw new DeveloperException(
                    'MISSING_SESSION',
                    'session is required for transactional methods',
                );

            const sessionStartedOutsideThisDecorator =
                PersistenceFactory.aMongoDbPersistence().sessionStarted(session);

            if (!sessionStartedOutsideThisDecorator)
                await PersistenceFactory.aMongoDbPersistence().startSession(session);

            await PersistenceFactory.aMongoDbPersistence().startTransaction(session);

            try {
                const result = originalMethod.apply(this, args);

                if (result instanceof Promise) {
                    await result;
                }

                await PersistenceFactory.aMongoDbPersistence().commitTransaction(session);

                return result;
            } catch (e) {
                await PersistenceFactory.aMongoDbPersistence().abortTransaction(session);

                throw e;
            } finally {
                if (!sessionStartedOutsideThisDecorator)
                    await PersistenceFactory.aMongoDbPersistence().endSession(session);
            }
        };

        return descriptor;
    };
}

export { Transactional };
