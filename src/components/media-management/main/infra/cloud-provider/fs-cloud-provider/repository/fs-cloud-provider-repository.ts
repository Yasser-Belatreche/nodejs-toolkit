export interface FsCloudProviderRepository {
    save(id: string, path: string): Promise<void>;

    ofId(id: string): Promise<string | null>;
}
