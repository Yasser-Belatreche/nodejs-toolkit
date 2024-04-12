import { LocalFile } from '@lib/primitives/generic/types/local-file';

export interface MediaRegisteredAnswers {
    'Media.Upload': {
        takes: { file: LocalFile; options: { folder: string; label: string } };
        returns: { id: string };
    };

    'Media.Delete': {
        takes: { id: string };
        returns: { id: string };
    };
}
