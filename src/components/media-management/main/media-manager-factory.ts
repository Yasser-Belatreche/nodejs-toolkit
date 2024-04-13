import { MediaManager } from './media-manager';
import { MediaManagerFacade } from './media-manager-facade';
import { MediaManagerInitializer } from './media-manager-initializer';
import { MediaManagerAuthorizationAndLoggerDecorator } from './media-manager-authorization-and-logger-decorator';

import { InMemoryMediaAssetRepository } from './infra/in-memory-media-asset-repository';
import { CloudinaryCloudProvider } from './infra/cloud-provider/cloudinary-cloud-provider';
import { FileCompressorComposite } from './infra/file-compressor/file-compressor-composite';

import { CloudinaryClient } from '@lib/cloud/cloudinary/cloudinary';
import { MessagesBroker } from '@lib/messages-broker/main/messages-broker';

let facade: MediaManager;
let instance: MediaManager;

const getFacade = (cloudinaryClient: CloudinaryClient): MediaManager => {
    if (!facade) {
        facade = new MediaManagerFacade(
            new CloudinaryCloudProvider(cloudinaryClient),
            new FileCompressorComposite([]),
            new InMemoryMediaAssetRepository(),
        );
    }

    return facade;
};

const getInstance = (cloudinaryClient: CloudinaryClient): MediaManager => {
    if (!instance) {
        instance = new MediaManagerAuthorizationAndLoggerDecorator(getFacade(cloudinaryClient));
    }

    return instance;
};

const MediaManagerFactory = {
    async Setup(broker: MessagesBroker, cloudinaryClient: CloudinaryClient): Promise<void> {
        MediaManagerInitializer.Init(broker, getFacade(cloudinaryClient));
    },

    anInstance(cloudinaryClient: CloudinaryClient): MediaManager {
        return getInstance(cloudinaryClient);
    },
};

export { MediaManagerFactory };
