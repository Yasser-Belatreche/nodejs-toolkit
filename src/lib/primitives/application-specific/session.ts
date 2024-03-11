import { Person } from './person';

export interface SessionCorrelationId extends Pick<Session, 'correlationId'> {}

export interface Session {
    correlationId: string;

    user: {
        id: string;
        role: string;
        permissions: string[];
        profile: Person;
    };

    // exists in case of using the api key authentication
    apiKey?: {
        id: string;
        name: string;
        permissions: string[];
    };

    // exists in case of using the client authentication
    client?: {
        id: string;
        name: string;
        permissions: string[];
    };
}
