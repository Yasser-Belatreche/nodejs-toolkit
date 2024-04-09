import { Session } from '@lib/primitives/application-specific/session';
import { Permission, PermissionNoWildCard } from '@lib/primitives/application-specific/permissions';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

import { AuthorizationException } from './core/domain/exceptions/authorization-exception';

function Authorize(permission: PermissionNoWildCard) {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            let session: Session | undefined;

            for (const arg of args) {
                if (arg instanceof Object && 'session' in arg) {
                    if ('user' in arg.session) {
                        session = arg.session as Session;
                        break;
                    }
                }
            }

            if (!session)
                throw new DeveloperException(
                    'WRONG_USAGE_OF_AUTHORIZE_DECORATOR',
                    'To use the Authorize decorator, one of the arguments of the decorated function have include a session object',
                );

            const { user, apiKey, client } = session;

            if (apiKey) {
                if (!IsPermissionsMatches(permission, apiKey.permissions))
                    throw new AuthorizationException(
                        `you do not have permissions to do this action`,
                    );

                return originalMethod.apply(this, args);
            }

            if (client) {
                if (!IsPermissionsMatches(permission, client.permissions))
                    throw new AuthorizationException(
                        `you do not have permissions to do this action`,
                    );

                return originalMethod.apply(this, args);
            }

            if (!IsPermissionsMatches(permission, user.permissions))
                throw new AuthorizationException(`you do not have permissions to do this action`);

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

const IsPermissionsMatches = (target: PermissionNoWildCard, permissions: Permission[]): boolean => {
    const havePermission = permissions.find(permission => {
        if (permission === '*') return true;

        if (permission === target) return true;

        const [topic, operation, action] = permission.split('/');
        const [targetTopic, targetOperation, targetAction] = target.split('/');

        if (topic === '*' && operation === targetOperation && action === '*') return true;

        if (topic !== targetTopic) return false;

        if (operation === '*') return true;

        if (operation !== targetOperation) return false;

        if (action === '*') return true;

        if (action === targetAction) return true;

        return false;
    });

    return !!havePermission;
};

export { Authorize, IsPermissionsMatches };
