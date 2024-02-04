import { Library } from '@lib/library';

const Managers = {
    async Init() {
        await Library.Init();
    },

    async Destroy() {
        await Library.Destroy();
    },
};

export { Managers };
