import { MediaAsset } from './media-asset';

export interface MediaAssetRepository {
    save(asset: MediaAsset): Promise<void>;

    ofId(id: string): Promise<MediaAsset | null>;

    delete(id: string): Promise<void>;
}
