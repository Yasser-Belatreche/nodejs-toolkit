import { LocalFile } from '@lib/primitives/generic/types/local-file';
import { Answer } from '@lib/messages-broker/main/sync-messages-broker/sync-messages-broker';

import { MediaManager } from '../../media-manager';

class UploadAnswer implements Answer<'Media.Upload'> {
    constructor(private readonly manager: MediaManager) {}

    question(): 'Media.Upload' {
        return 'Media.Upload';
    }

    async answer(params: {
        file: LocalFile;
        options: { folder: string; label: string };
    }): Promise<{ id: string }> {
        const { id } = await this.manager.upload(params.file, params.options);

        return { id };
    }
}

export { UploadAnswer };
