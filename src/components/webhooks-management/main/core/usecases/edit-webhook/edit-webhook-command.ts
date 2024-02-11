export interface EditWebhookCommand {
    id: string;
    deliveryUrl: string;
    events: string[];
}
