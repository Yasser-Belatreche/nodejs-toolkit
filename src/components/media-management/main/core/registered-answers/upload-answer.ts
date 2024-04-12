import {
    Answer,
    RegisteredAnswers,
} from '@lib/messages-broker/main/sync-messages-broker/sync-messages-broker';

import { MediaManager } from '../../media-manager';
import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

class UploadAnswer implements Answer<'Media.Upload'> {
    constructor(private readonly manager: MediaManager) {}

    question(): 'Media.Upload' {
        return 'Media.Upload';
    }

    async answer(
        params: RegisteredAnswers['Media.Upload']['takes'],
        session: SessionCorrelationId,
    ): Promise<RegisteredAnswers['Media.Upload']['returns']> {
        const { id } = await this.manager.upload({
            file: params.file,
            options: params.options,
            session: session as any,
        });

        return { id };
    }
}

export { UploadAnswer };
