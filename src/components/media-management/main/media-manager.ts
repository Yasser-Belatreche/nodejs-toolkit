import { Query } from '@lib/primitives/application-specific/query';
import { LocalFile } from '@lib/primitives/generic/types/local-file';
import { ProtectedCommand } from '@lib/primitives/application-specific/command';

export interface MediaManager {
    delete(command: DeleteFileCommand): Promise<DeleteFileCommandResponse>;

    upload(command: UploadFileCommand): Promise<UploadFileCommandResponse>;

    getById(query: GetFileByIdQuery): Promise<GetFileByIdQueryResponse>;
}

export interface DeleteFileCommand extends ProtectedCommand {
    id: string;
}
export interface DeleteFileCommandResponse {
    id: string;
}

export interface UploadFileCommand extends ProtectedCommand {
    file: LocalFile;
    options: { folder: string; label: string };
}
export interface UploadFileCommandResponse {
    id: string;
    url: string;
}

export interface GetFileByIdQuery extends Query {
    id: string;
}
export interface GetFileByIdQueryResponse {
    url: string;
}
