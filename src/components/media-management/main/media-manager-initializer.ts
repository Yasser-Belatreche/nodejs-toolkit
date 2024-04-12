import { MediaManager } from './media-manager';

import { UploadAnswer } from './core/registered-answers/upload-answer';
import { DeleteAnswer } from './core/registered-answers/delete-answer';

import { MessagesBroker } from '@lib/messages-broker/main/messages-broker';

let IsInitialized = false;

const MediaManagerInitializer = {
    Init(broker: MessagesBroker, manager: MediaManager): void {
        if (IsInitialized) return;

        broker.registerAnswer(new UploadAnswer(manager));
        broker.registerAnswer(new DeleteAnswer(manager));

        IsInitialized = true;
    },
};

export { MediaManagerInitializer };
