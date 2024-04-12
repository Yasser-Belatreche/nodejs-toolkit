import { Library } from '@lib/library';

import { RateLimitingManager } from './rate-limiting-management/main/rate-limiting-manager';
import { RateLimitingManagerFactory } from './rate-limiting-management/main/rate-limiting-manager-factory';

import { MediaManager } from './media-management/main/media-manager';
import { MediaManagerFactory } from './media-management/main/media-manager-factory';

const Managers = {
    async Init() {
        await Library.Init();

        await MediaManagerFactory.Setup(Library.aMessagesBroker(), Library.aCloudinaryClient());
    },

    async Destroy() {
        await Library.Destroy();
    },

    aReteLimitingManager(): RateLimitingManager {
        return RateLimitingManagerFactory.anInstance(Library.aCache());
    },

    aMediaManager(): MediaManager {
        return MediaManagerFactory.anInstance(Library.aCloudinaryClient());
    },
};

export { Managers };
