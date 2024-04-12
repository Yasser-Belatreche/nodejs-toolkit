import { v2 as cloudinary } from 'cloudinary';

interface Config {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
}

export type CloudinaryClient = typeof cloudinary;

class Cloudinary {
    constructor(config: Config) {
        cloudinary.config({
            api_key: config.apiKey,
            api_secret: config.apiSecret,
            cloud_name: config.cloudName,
        });
    }

    Client(): CloudinaryClient {
        return cloudinary;
    }
}

export { Cloudinary };
