export interface CreateWebhookCommand {
    assigneeId: string;
    deliveryUrl: string;
    events: string[];

    createdBy: string;
}
