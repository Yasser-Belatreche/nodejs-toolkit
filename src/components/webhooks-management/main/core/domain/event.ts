export interface Event {
    eventId: string;
    occurredAt: Date;
    name: string;
    payload: Record<string, any>;
}
