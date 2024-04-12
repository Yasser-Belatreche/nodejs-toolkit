import { Result } from '@lib/primitives/generic/patterns/result';
import { LocalFile } from '@lib/primitives/generic/types/local-file';

import { CannotUploadFileException } from './exceptions/cannot-upload-file-exception';

export interface CloudProvider {
    upload(
        file: LocalFile,
        options: { folder: string },
    ): Promise<Result<{ url: string; idInCloud: string }, CannotUploadFileException>>;

    delete(idInCloud: string): Promise<void>;
}
