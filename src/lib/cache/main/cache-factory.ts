import { Cache } from './cache';
import { InMemoryCache } from './in-memory-cache';

const CacheFactory = {
    anInstance(): Cache {
        return InMemoryCache.Instance();
    },
};

export { CacheFactory };
