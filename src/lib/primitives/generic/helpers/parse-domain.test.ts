import assert from 'node:assert';
import { faker } from '@faker-js/faker';
import { describe, it } from 'node:test';

import { ParseDomain } from './parse-domain';

await describe('parse domain helper', async () => {
    await it('return false when the domain is not valid', async () => {
        assert.equal(ParseDomain(`invalid-domain`), false);
    });

    await it('should accept an uppercased domain and return it lowercased', async () => {
        const validDomain = faker.internet.domainName();

        assert.equal(ParseDomain(validDomain.toUpperCase()), validDomain.toLowerCase());
    });

    await it('when passing a url with an http protocol should get the domain out of it', async () => {
        const validDomain = faker.internet.domainName();

        assert.equal(
            ParseDomain(`http://${validDomain}/path/here?query=param`),
            validDomain.toLowerCase(),
        );
    });
});
