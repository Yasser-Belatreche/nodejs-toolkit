export interface WebhookPayload {
    headers: {
        'X-Webhook-Id': string;
        'X-Webhook-Signature': string;
        'X-Webhook-Event': string;
        'Content-Type': 'application/json';
    };
    body: {
        eventId: string;
        occurredAt: Date;
        name: string;
        payload: Record<string, any>;
    };
}
