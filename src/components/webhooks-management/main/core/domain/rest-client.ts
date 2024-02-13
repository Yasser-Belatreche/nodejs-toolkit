import { Event } from './event';

export interface RestClient {
    post(
        url: string,
        body: Event,
        headers: {
            'X-Webhook-Id': string;
            'X-Webhook-Signature': string;
            'X-Webhook-Trigger': string;
            'Content-Type': 'application/json';
        },
    ): Promise<{ status: number; response: any }>;
}
