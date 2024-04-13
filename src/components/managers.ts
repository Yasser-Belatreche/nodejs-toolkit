import { Library } from '@lib/library';

import { RateLimitingManager } from './rate-limiting-management/main/rate-limiting-manager';
import { RateLimitingManagerFactory } from './rate-limiting-management/main/rate-limiting-manager-factory';

import { MediaManager } from './media-management/main/media-manager';
import { MediaManagerFactory } from './media-management/main/media-manager-factory';

import { WebhooksManager } from './webhooks-management/main/webhooks-manager';
import { WebhooksManagerFactory } from './webhooks-management/main/webhooks-manager-factory';

const Managers = {
    async Init() {
        await Library.Init();

        await MediaManagerFactory.Setup(Library.aMessagesBroker(), Library.aCloudinaryClient());
        await WebhooksManagerFactory.Setup(Library.aMessagesBroker(), Library.aJobsScheduler());
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

    aWebhooksManager(): WebhooksManager {
        return WebhooksManagerFactory.anInstance();
    },
};

export { Managers };
