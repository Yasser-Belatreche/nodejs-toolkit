import * as crypto from 'crypto';

import { Event } from './event';

const GenerateSignature = (secret: string, payload: Event): string => {
    const stringifiedPayload = JSON.stringify(payload);

    const signature = crypto.createHmac('sha256', secret).update(stringifiedPayload).digest('hex');

    return signature;
};

export { GenerateSignature };
