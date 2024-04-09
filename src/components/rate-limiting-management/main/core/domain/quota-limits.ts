export interface QuotaLimits {
    perSecond: number;
    perMinute: number;
    perHour: number;
    perDay: number;
}

const defaultQuotaLimits: QuotaLimits = {
    perSecond: 5,
    perMinute: 60,
    perHour: 600,
    perDay: 14400,
};

export { defaultQuotaLimits };
