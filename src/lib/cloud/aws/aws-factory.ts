import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

import { Aws } from './aws';

const AwsFactory = {
    anInstance(): Aws {
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        const region = process.env.AWS_REGION;

        if (!accessKeyId)
            throw new DeveloperException(
                'MISSING_ENV_VARIABLE',
                'missing AWS_ACCESS_KEY_ID env variable',
            );

        if (!secretAccessKey)
            throw new DeveloperException(
                'MISSING_ENV_VARIABLE',
                'missing AWS_SECRET_ACCESS_KEY env variable',
            );

        if (!region)
            throw new DeveloperException('MISSING_ENV_VARIABLE', 'missing AWS_REGION env variable');

        return new Aws({ accessKeyId, secretAccessKey, region });
    },
};

export { AwsFactory };
