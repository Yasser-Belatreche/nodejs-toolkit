export type Permission =
    | '*'
    | '*/read/*'
    | '*/write/*'
    | `${Lowercase<string>}/${'*'}`
    | `${Lowercase<string>}/${'read' | 'write'}/${Lowercase<string> | '*'}`;

export type PermissionNoWildCard = `${Lowercase<string>}/${'read' | 'write'}/${Lowercase<string>}`;

export type Permissions = Record<string, Permission>;
