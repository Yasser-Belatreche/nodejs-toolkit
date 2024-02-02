export type Permission =
    | '*'
    | '*/read/*'
    | '*/write/*'
    | `${Lowercase<string>}/${'*'}`
    | `${Lowercase<string>}/${'read' | 'write'}/${Lowercase<string> | '*'}`;

export type Permissions = Record<string, Permission>;

const IsPermissionsMatches = (permissions: Permission[], target: Permission): boolean => {
    const havePermission = permissions.find(permission => {
        if (permission === '*') return true;

        if (permission === target) return true;

        const [topic, operation, action] = permission.split('/');
        const [targetTopic, targetOperation, targetAction] = target.split('/');

        if (topic === '*' && action === '*' && operation === targetOperation) return true;

        if (topic !== targetTopic) return false;

        if (operation === '*') return true;

        if (operation !== targetOperation) return false;

        if (action === '*') return true;

        if (action === targetAction) return true;

        return false;
    });

    return !!havePermission;
};

export { IsPermissionsMatches };
