import { MediaManager } from './media-manager';
import { MediaManagerFacade } from './media-manager-facade';

import { InMemoryMediaAssetRepository } from './infra/in-memory-media-asset-repository';
import { CloudinaryCloudProvider } from './infra/cloud-provider/cloudinary-cloud-provider';
import { FileCompressorComposite } from './infra/file-compressor/file-compressor-composite';

import { CloudinaryClient } from '@lib/cloud/cloudinary/cloudinary';
import { MessagesBroker } from '@lib/messages-broker/main/messages-broker';

const MediaManagerFactory = {
    async Setup(broker: MessagesBroker): Promise<void> {},

    anInstance(cloudinaryClient: CloudinaryClient): MediaManager {
        return new MediaManagerFacade(
            new CloudinaryCloudProvider(cloudinaryClient),
            new FileCompressorComposite([]),
            new InMemoryMediaAssetRepository(),
        );
    },
};

export { MediaManagerFactory };
