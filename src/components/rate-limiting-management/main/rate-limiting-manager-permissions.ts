import { Permissions } from '@lib/primitives/application-specific/permissions';

export const RateLimitingPermissions = {
    GetQuotaSummary: 'rate-limiting/read/quota-summary',
    GetQuotaLimits: 'rate-limiting/read/quota-limits',
    ChangeQuotaLimits: 'rate-limiting/write/change-quota-limits',

    ReadAll: 'rate-limiting/read/*',
    WriteAll: 'rate-limiting/write/*',
    All: 'rate-limiting/*',
} satisfies Permissions;
