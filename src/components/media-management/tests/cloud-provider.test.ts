import path from 'path';
import { describe, it } from 'node:test';

import { Library } from '@lib/library';

import { CloudProvider } from '../main/core/domain/cloud-provider';

import { AwsS3CloudProvider } from '../main/infra/cloud-provider/aws-s3-cloud-provider';
import { CloudinaryCloudProvider } from '../main/infra/cloud-provider/cloudinary-cloud-provider';

await describe('cloud provider', async () => {
    const providers: CloudProvider[] = [
        new CloudinaryCloudProvider(Library.aCloudinaryClient()),
        new AwsS3CloudProvider(Library.anAwsS3Client(), 'my-test-bucket'),
    ];

    for (const provider of providers) {
        // provide env correct variables and uncomment the following line
        await describe.skip(provider.constructor.name, async () => {
            await testCasesOn(provider);
        });
    }
});

async function testCasesOn(provider: CloudProvider): Promise<void> {
    await it('should upload assets', async () => {
        const res = await provider.upload(
            {
                mimetype: 'image/jpeg',
                originalname: 'donut.jpeg',
                path: path.resolve(__dirname, './fixtures/donut.jpeg'),
                size: 1903,
            },
            { folder: 'test/test' },
        );

        console.log(res.unpack().url);
    });

    await it('should delete it', async () => {
        const res = await provider.upload(
            {
                mimetype: 'image/jpeg',
                originalname: 'donut.jpeg',
                path: path.resolve(__dirname, './fixtures/donut.jpeg'),
                size: 1903,
            },
            { folder: 'test/test' },
        );

        console.log(res.unpack().url);

        await provider.delete(res.unpack().idInCloud);
    });
}
