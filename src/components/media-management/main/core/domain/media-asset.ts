import { LocalFile } from '@lib/primitives/generic/types/local-file';
import { GenerateUuid } from '@lib/primitives/generic/helpers/generate-uuid';

export interface MediaAsset {
    id: string;
    idInCloud: string;
    url: string;
    label: string;
    folder: string;
    filename: string;
    createdAt: Date;
}

const CreateMediaAsset = (
    file: LocalFile,
    folder: string,
    label: string,
    idInCloud: string,
    url: string,
): MediaAsset => {
    const id = GenerateUuid();

    return {
        id,
        idInCloud,
        url,
        label,
        folder,
        filename: file.originalname,
        createdAt: new Date(),
    };
};

export { CreateMediaAsset };
