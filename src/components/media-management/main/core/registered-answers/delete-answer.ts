import {
    Answer,
    RegisteredAnswers,
} from '@lib/messages-broker/main/sync-messages-broker/sync-messages-broker';
import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

import { MediaManager } from '../../media-manager';

class DeleteAnswer implements Answer<'Media.Delete'> {
    constructor(private readonly manager: MediaManager) {}

    question(): 'Media.Delete' {
        return 'Media.Delete';
    }

    async answer(
        params: RegisteredAnswers['Media.Delete']['takes'],
        session: SessionCorrelationId,
    ): Promise<RegisteredAnswers['Media.Delete']['returns']> {
        await this.manager.delete({
            id: params.id,
            session: session as any,
        });

        return { id: params.id };
    }
}

export { DeleteAnswer };
