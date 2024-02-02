import { Person } from './person';

export interface WithSession {
    session: Session;
}

export interface WithSessionCorrelationId {
    session: SessionCorrelationId;
}

export interface SessionCorrelationId extends Pick<Session, 'correlationId'> {}

export interface WithOptionalSession {
    session?: Session;
}

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
        name: string;
        permissions: string[];
    };

    // exists in case of using the client authentication
    client?: {
        name: string;
        permissions: string[];
    };
}
