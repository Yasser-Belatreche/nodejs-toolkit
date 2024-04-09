import { describe, it } from 'node:test';
import { IsPermissionsMatches } from '../main/authorize-decorator';
import assert from 'node:assert';

await describe('Is Permissions Match', async () => {
    await it('having "*" -> should match all permissions', async () => {
        const permissions = ['topic/read/action', 'topic2/read/action2'] as const;

        permissions.forEach(permission => {
            assert.ok(IsPermissionsMatches(permission, ['*']));
        });
    });

    await it('having "*/read/*" -> should match all read permissions', async () => {
        const permissions = ['topic/read/action', 'topic2/read/action2'] as const;

        permissions.forEach(permission => {
            assert.ok(IsPermissionsMatches(permission, ['*/read/*']));
        });

        assert.ok(!IsPermissionsMatches('topic/write/action', ['*/read/*']));
    });

    await it('having "*/write/*" -> should match all write permissions', async () => {
        const permissions = ['topic/write/action', 'topic2/write/action2'] as const;

        permissions.forEach(permission => {
            assert.ok(IsPermissionsMatches(permission, ['*/write/*']));
        });

        assert.ok(!IsPermissionsMatches('topic/read/action', ['*/write/*']));
    });

    await it('having "<TOPIC>/*" -> should match all the permission of that topic', async () => {
        const permissions = ['topic/read/action', 'topic/write/action2'] as const;

        permissions.forEach(permission => {
            assert.ok(IsPermissionsMatches(permission, ['topic/*']));
        });
    });

    await it('having "<TOPIC>/read/*" -> should match any read permission for that topic', async () => {
        const permissions = ['topic/read/action', 'topic/read/action2'] as const;

        permissions.forEach(permission => {
            assert.ok(IsPermissionsMatches(permission, ['topic/read/*']));
        });

        assert.ok(!IsPermissionsMatches('topic/write/action', ['topic/read/*']));
        assert.ok(!IsPermissionsMatches('topic2/read/action', ['topic/read/*']));
    });

    await it('having "<TOPIC>/write/*" -> should match any write permission for that topic', async () => {
        const permissions = ['topic/write/action', 'topic/write/action2'] as const;

        permissions.forEach(permission => {
            assert.ok(IsPermissionsMatches(permission, ['topic/write/*']));
        });

        assert.ok(!IsPermissionsMatches('topic/read/action', ['topic/write/*']));
        assert.ok(!IsPermissionsMatches('topic2/write/action', ['topic/write/*']));
    });

    await it('having "<TOPIC>/<OPERATION>/<ACTION>" -> should match exactly that permission', async () => {
        const permissions = ['topic/read/action', 'topic/write/action'] as const;

        permissions.forEach(permission => {
            assert.ok(IsPermissionsMatches(permission, [permission]));
        });

        assert.ok(!IsPermissionsMatches('topic/read/action', ['topic/write/action']));
        assert.ok(!IsPermissionsMatches('topic/write/action', ['topic/read/action']));
    });
});
