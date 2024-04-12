import { Answer } from '@lib/messages-broker/main/sync-messages-broker/sync-messages-broker';

import { MediaManager } from '../../media-manager';

class DeleteAnswer implements Answer<'Media.Delete'> {
    constructor(private readonly manager: MediaManager) {}

    question(): 'Media.Delete' {
        return 'Media.Delete';
    }

    async answer(params: { id: string }): Promise<{ id: string }> {
        await this.manager.delete(params.id);

        return { id: params.id };
    }
}

export { DeleteAnswer };
