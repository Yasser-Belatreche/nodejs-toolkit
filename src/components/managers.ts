import { Library } from '@lib/library';

import { RateLimitingManager } from './rate-limiting-management/main/rate-limiting-manager';
import { RateLimitingManagerFactory } from './rate-limiting-management/main/rate-limiting-manager-factory';

const Managers = {
    async Init() {
        await Library.Init();
    },

    async Destroy() {
        await Library.Destroy();
    },

    aReteLimitingManager(): RateLimitingManager {
        return RateLimitingManagerFactory.anInstance(Library.aCache());
    },
};

export { Managers };
