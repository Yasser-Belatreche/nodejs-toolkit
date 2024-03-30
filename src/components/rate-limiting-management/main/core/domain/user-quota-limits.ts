export interface UserQuotaLimits {
    userId: string;

    perSecond: number;
    perMinute: number;
    perHour: number;
    perDay: number;
}

const defaultQuotaLimits: UserQuotaLimits = {
    userId: 'DEFAULT',
    perSecond: 5,
    perMinute: 60,
    perHour: 600,
    perDay: 14400,
};

export { defaultQuotaLimits };
