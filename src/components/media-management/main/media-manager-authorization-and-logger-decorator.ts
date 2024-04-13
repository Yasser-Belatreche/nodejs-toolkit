import { Log } from '@lib/logger/main/log-decorator';
import { GetComponentActionLogMessage } from '@lib/primitives/application-specific/consistency/log-messages';

import { Authorize } from '../../auth-management/main/authorize-decorator';

import {
    DeleteFileCommand,
    DeleteFileCommandResponse,
    GetFileByIdQuery,
    GetFileByIdQueryResponse,
    MediaManager,
    UploadFileCommand,
    UploadFileCommandResponse,
} from './media-manager';
import { MediaPermissions } from './media-manager-permissions';

class MediaManagerAuthorizationAndLoggerDecorator implements MediaManager {
    constructor(private readonly manager: MediaManager) {}

    @Log(msg('uploading file'))
    @Authorize(MediaPermissions.UploadFile)
    async upload(command: UploadFileCommand): Promise<UploadFileCommandResponse> {
        return await this.manager.upload(command);
    }

    @Log(msg('deleting file'))
    @Authorize(MediaPermissions.DeleteFile)
    async delete(command: DeleteFileCommand): Promise<DeleteFileCommandResponse> {
        return await this.manager.delete(command);
    }

    async getById(query: GetFileByIdQuery): Promise<GetFileByIdQueryResponse> {
        return await this.manager.getById(query);
    }
}

function msg(str: string): string {
    return GetComponentActionLogMessage('media manager', str);
}

export { MediaManagerAuthorizationAndLoggerDecorator };
