import { Result } from '@lib/primitives/generic/patterns/result';
import { LocalFile } from '@lib/primitives/generic/types/local-file';

import { CloudProvider } from '../../core/domain/cloud-provider';
import { CannotUploadFileException } from '../../core/domain/exceptions/cannot-upload-file-exception';

import { CloudinaryClient } from '@lib/cloud/cloudinary/cloudinary';

class CloudinaryCloudProvider implements CloudProvider {
    constructor(private readonly client: CloudinaryClient) {}

    async upload(
        file: LocalFile,
        options: { folder: string },
    ): Promise<Result<{ url: string; idInCloud: string }, CannotUploadFileException>> {
        try {
            const { secure_url: url, public_id: idInCloud } = await this.client.uploader.upload(
                file.path,
                { folder: options.folder },
            );

            return Result.Ok({ url, idInCloud });
        } catch (e) {
            return Result.Fail(new CannotUploadFileException((e as Error).message));
        }
    }

    async delete(idInCloud: string): Promise<void> {
        await this.client.uploader.destroy(idInCloud);
    }
}

export { CloudinaryCloudProvider };
