import { LocalFile } from '@lib/primitives/generic/types/local-file';

export interface FileCompressor {
    supports(file: LocalFile): boolean;

    compress(file: LocalFile): Promise<LocalFile>;
}
