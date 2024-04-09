import { Session, SessionCorrelationId } from '@lib/primitives/application-specific/session';

export interface Query {
    session: SessionCorrelationId;
}

export interface ProtectedQuery {
    session: Session;
}
