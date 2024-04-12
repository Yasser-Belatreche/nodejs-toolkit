import { MediaManager } from './media-manager';
import { MediaManagerFacade } from './media-manager-facade';

import { InMemoryMediaAssetRepository } from './infra/in-memory-media-asset-repository';
import { CloudinaryCloudProvider } from './infra/cloud-provider/cloudinary-cloud-provider';
import { FileCompressorComposite } from './infra/file-compressor/file-compressor-composite';

import { CloudinaryClient } from '@lib/cloud/cloudinary/cloudinary';
import { MessagesBroker } from '@lib/messages-broker/main/messages-broker';
import { MediaManagerInitializer } from './media-manager-initializer';

let instance: MediaManager;

const getInstance = (cloudinaryClient: CloudinaryClient): MediaManager => {
    if (!instance) {
        instance = new MediaManagerFacade(
            new CloudinaryCloudProvider(cloudinaryClient),
            new FileCompressorComposite([]),
            new InMemoryMediaAssetRepository(),
        );
    }

    return instance;
};

const MediaManagerFactory = {
    async Setup(broker: MessagesBroker, cloudinaryClient: CloudinaryClient): Promise<void> {
        MediaManagerInitializer.Init(broker, getInstance(cloudinaryClient));
    },

    anInstance(cloudinaryClient: CloudinaryClient): MediaManager {
        return getInstance(cloudinaryClient);
    },
};

export { MediaManagerFactory };
