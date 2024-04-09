import { Session, SessionCorrelationId } from '@lib/primitives/application-specific/session';

export interface Command {
    session: SessionCorrelationId;
}

export interface ProtectedCommand {
    session: Session;
}
