import { Quota } from './quota';

export interface QuotaSummary {
    perSecond: Quota;
    perMinute: Quota;
    perHour: Quota;
    perDay: Quota;
}
