import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

import { Cloudinary } from './cloudinary';

const CloudinaryFactory = {
    anInstance(): Cloudinary {
        const cloudName = process.env.CLOUDINARY_CLOUDNAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName)
            throw new DeveloperException(
                'NO_ENV_VARIABLE',
                'should have CLOUDINARY_API_KEY in the env',
            );

        if (!apiKey)
            throw new DeveloperException(
                'NO_ENV_VARIABLE',
                'should have CLOUDINARY_APIKEY in the env',
            );

        if (!apiSecret)
            throw new DeveloperException(
                'NO_ENV_VARIABLE',
                'should have CLOUDINARY_API_SECRET in the env',
            );

        return new Cloudinary({ cloudName, apiKey, apiSecret });
    },
};

export { CloudinaryFactory };
