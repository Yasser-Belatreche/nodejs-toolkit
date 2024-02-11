const baseBody = {
    eventId: '[STRING] represent the event id',
    occurredAt: '[ISO_STRING_DATE] represent the event occurred at',
    name: '[STRING] represent the event name',
};

export interface EventDocumentation {
    eventId: string;
    occurredAt: string;
    name: string;
    payload: Record<string, any>;
}

type EventName = string;

const SupportedEvents: Record<EventName, EventDocumentation> = {
    test: {
        ...baseBody,
        payload: {
            testAttribute: '[STRING] represent the some arbitrary data',
        },
    },
};

export { SupportedEvents };
