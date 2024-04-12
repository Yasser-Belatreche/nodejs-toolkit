import Sdk from 'aws-sdk';

interface Config {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
}

export type S3Client = Sdk.S3;

class Aws {
    constructor(config: Config) {
        Sdk.config.update({
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            region: config.region,
        });
    }

    S3Client(): S3Client {
        return new Sdk.S3();
    }
}

export { Aws };
