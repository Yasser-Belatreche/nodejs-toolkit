import fs from 'fs';
import path from 'path';

import { Result } from '@lib/primitives/generic/patterns/result';
import { LocalFile } from '@lib/primitives/generic/types/local-file';
import { GenerateUuid } from '@lib/primitives/generic/helpers/generate-uuid';

import { FsCloudProviderRepository } from './repository/fs-cloud-provider-repository';

import { CannotUploadFileException } from '../../../core/domain/exceptions/cannot-upload-file-exception';

import { CloudProvider } from '../../../core/domain/cloud-provider';

interface Config {
    folder: string;
    publicBaseUrl: string;
}

class FsCloudProvider implements CloudProvider {
    constructor(
        private readonly config: Config,
        private readonly repository: FsCloudProviderRepository,
    ) {}

    async upload(
        file: LocalFile,
        options: { folder: string },
    ): Promise<Result<{ url: string; idInCloud: string }, CannotUploadFileException>> {
        try {
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            const day = new Date().getDate();
            const hour = new Date().getHours();
            const minute = new Date().getMinutes();
            const second = new Date().getSeconds();
            const millisecond = new Date().getMilliseconds();

            const folder = path.join(
                this.config.folder,
                options.folder.replace(/[ _]/g, '-').toLowerCase(),
                year.toString(),
                month.toString(),
                day.toString(),
            );

            const filename = `${hour}-${minute}-${second}-${millisecond}__${file.originalname}`;

            await this.createFolderIfNotExists(folder);

            const destination = path.join(folder, filename);

            await fs.promises.copyFile(file.path, destination);

            const id = GenerateUuid();

            await this.repository.save(id, destination);

            return Result.Ok({
                url: `${this.config.publicBaseUrl}/${folder}/${filename}`,
                idInCloud: id,
            });
        } catch (e) {
            return Result.Fail(new CannotUploadFileException((e as Error).message));
        }
    }

    async delete(idInCloud: string): Promise<void> {
        const file = await this.repository.ofId(idInCloud);

        if (file) {
            await fs.promises.unlink(file);
        }
    }

    private async createFolderIfNotExists(folder: string): Promise<void> {
        await fs.promises.mkdir(folder, { recursive: true });
    }
}

export { FsCloudProvider };
