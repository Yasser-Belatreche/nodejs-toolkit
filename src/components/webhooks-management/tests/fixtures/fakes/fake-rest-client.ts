import { RestClient } from '../../../main/core/domain/rest-client';

class FakeRestClient implements RestClient {
    async post(url: string, body: any, headers: any): Promise<{ status: number; response: any }> {
        return { status: 200, response: { message: 'ok' } };
    }
}

export { FakeRestClient };
