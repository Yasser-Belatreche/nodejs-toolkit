import { MediaAsset } from '../core/domain/media-asset';
import { MediaAssetRepository } from '../core/domain/media-asset-repository';

class InMemoryMediaAssetRepository implements MediaAssetRepository {
    private readonly map = new Map<string, MediaAsset>();

    async save(asset: MediaAsset): Promise<void> {
        this.map.set(asset.id, asset);
    }

    async delete(id: string): Promise<void> {
        this.map.delete(id);
    }

    async ofId(id: string): Promise<MediaAsset | null> {
        return this.map.get(id) ?? null;
    }
}

export { InMemoryMediaAssetRepository };
