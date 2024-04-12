import { LocalFile } from '@lib/primitives/generic/types/local-file';

import { FileCompressor } from '../../core/domain/file-compressor';

class FileCompressorComposite implements FileCompressor {
    constructor(private readonly compressors: FileCompressor[]) {}

    async compress(file: LocalFile): Promise<LocalFile> {
        let compressed = file;

        for (const compressor of this.compressors) {
            if (compressor.supports(compressed)) {
                compressed = await compressor.compress(file);
            }
        }

        return compressed;
    }

    supports(file: LocalFile): boolean {
        for (const compressor of this.compressors) {
            if (compressor.supports(file)) return true;
        }

        return false;
    }
}

export { FileCompressorComposite };
