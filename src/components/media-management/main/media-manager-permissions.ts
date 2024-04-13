import { Permissions } from '@lib/primitives/application-specific/permissions';

export const MediaPermissions = {
    UploadFile: 'media/write/upload',
    DeleteFile: 'media/write/delete',
    GetFileById: 'media/read/file',

    ReadAll: 'media/read/*',
    WriteAll: 'media/write/*',
    All: 'media/*',
} satisfies Permissions;
