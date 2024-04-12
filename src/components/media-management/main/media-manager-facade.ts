import fs from 'fs/promises';

import {
    DeleteFileCommand,
    DeleteFileCommandResponse,
    GetFileByIdQuery,
    GetFileByIdQueryResponse,
    MediaManager,
    UploadFileCommand,
    UploadFileCommandResponse,
} from './media-manager';

import { CreateMediaAsset } from './core/domain/media-asset';

import { NotFoundException } from './core/domain/exceptions/not-found-exception';

import { CloudProvider } from './core/domain/cloud-provider';
import { FileCompressor } from './core/domain/file-compressor';
import { MediaAssetRepository } from './core/domain/media-asset-repository';

class MediaManagerFacade implements MediaManager {
    constructor(
        private readonly cloudProvider: CloudProvider,
        private readonly fileCompressor: FileCompressor,
        private readonly assetRepository: MediaAssetRepository,
    ) {}

    async upload(command: UploadFileCommand): Promise<UploadFileCommandResponse> {
        let file = command.file;

        if (this.fileCompressor.supports(file)) {
            const oldPath = file.path;

            file = await this.fileCompressor.compress(file);

            try {
                await fs.unlink(oldPath);
            } catch (e) {}
        }

        const res = await this.cloudProvider.upload(file, {
            folder: `myapp/${command.options.folder}`,
        });

        if (!res.success()) throw res.error();

        const { url, idInCloud } = res.unpack();

        const asset = CreateMediaAsset(
            file,
            command.options.folder,
            command.options.label,
            idInCloud,
            url,
        );

        await this.assetRepository.save(asset);

        try {
            await fs.unlink(file.path);
        } catch (e) {}

        return { id: asset.id, url: asset.url };
    }

    async delete(command: DeleteFileCommand): Promise<DeleteFileCommandResponse> {
        const asset = await this.assetRepository.ofId(command.id);

        if (!asset) throw new NotFoundException(`not media assert found with id ${command.id}`);

        await this.cloudProvider.delete(asset.idInCloud);

        return { id: asset.id };
    }

    async getById(query: GetFileByIdQuery): Promise<GetFileByIdQueryResponse> {
        const asset = await this.assetRepository.ofId(query.id);

        if (!asset) throw new NotFoundException(`not media assert found with id ${query.id}`);

        return { url: asset.url };
    }
}

export { MediaManagerFacade };
