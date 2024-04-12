import fs from 'fs';
import { Result } from '@lib/primitives/generic/patterns/result';
import { LocalFile } from '@lib/primitives/generic/types/local-file';

import { S3Client } from '@lib/cloud/aws/aws';

import { CloudProvider } from '../../core/domain/cloud-provider';
import { CannotUploadFileException } from '../../core/domain/exceptions/cannot-upload-file-exception';

class AwsS3CloudProvider implements CloudProvider {
    constructor(
        private readonly client: S3Client,
        private readonly bucketName: string,
    ) {}

    async upload(
        file: LocalFile,
        options: { folder: string },
    ): Promise<
        Result<
            {
                url: string;
                idInCloud: string;
            },
            CannotUploadFileException
        >
    > {
        try {
            const fileStream = fs.createReadStream(file.path);

            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            const day = new Date().getDate();
            const hour = new Date().getHours();
            const minute = new Date().getMinutes();
            const second = new Date().getSeconds();
            const millisecond = new Date().getMilliseconds();

            const folder = `${options.folder.replace(/ /g, '-').toLowerCase()}/${year}/${month}/${day}`;

            const key = `${folder}/${hour}-${minute}-${second}-${millisecond}__${file.originalname}`;

            const { Location, Key } = await this.client
                .upload({ Bucket: this.bucketName, Key: key, Body: fileStream })
                .promise();

            return Result.Ok({ url: Location, idInCloud: Key });
        } catch (e) {
            return Result.Fail(new CannotUploadFileException((e as Error).message));
        }
    }

    async delete(idInCloud: string): Promise<void> {
        await this.client.deleteObject({ Bucket: this.bucketName, Key: idInCloud }).promise();
    }
}

export { AwsS3CloudProvider };
