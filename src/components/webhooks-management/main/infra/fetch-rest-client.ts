import { Event } from '../core/domain/event';
import { RestClient } from '../core/domain/rest-client';

class FetchRestClient implements RestClient {
    async post(
        url: string,
        body: Event,
        headers: Record<string, any>,
    ): Promise<{ status: number; response: any }> {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (response.headers.get('content-type')?.includes('application/json')) {
                return {
                    status: response.status,
                    response: await response.json(),
                };
            }

            return {
                status: response.status,
                response: await response.text(),
            };
        } catch (e) {
            return {
                status: 500,
                response: 'UNKONWN_ERROR',
            };
        }
    }
}

export { FetchRestClient };
