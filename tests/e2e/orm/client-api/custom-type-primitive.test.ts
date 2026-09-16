import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ClientContract } from '@zenstackhq/orm';
import { schema } from '../schemas/typed-json-primitive/schema';
import { createTestClient } from '@zenstackhq/testtools';

process.env['TEST_DB_PROVIDER'] = 'postgresql';

describe('Custom type primitive tests', () => {
    let client: ClientContract<typeof schema>;

    beforeEach(async () => {
        client = await createTestClient(schema);
    });

    afterEach(async () => {
        await client?.$disconnect();
    });

    it('works', async () => {
        await expect(
            client.user.create({
                data: {
                    name: 'test',
                },
            }),
        ).resolves.toMatchObject({
            name: 'test',
        });

        await expect(
            client.user.create({
                data: {
                    name: 't',
                },
            }),
        ).rejects.toThrow(/Too small/);
    });

    it('works 2', async () => {
        await expect(
            client.user.create({
                data: {
                    name: 'test',
                    contacts: ['+15555555555'],
                },
            }),
        ).resolves.toMatchObject({
            name: 'test',
            contacts: ['+15555555555'],
        });
    });

    it('works 3', async () => {
        await expect(
            client.user.create({
                data: {
                    name: 'test',
                    age: 19,
                },
            }),
        ).resolves.toMatchObject({
            name: 'test',
            age: 19,
        });

        await expect(
            client.user.create({
                data: {
                    name: 'test',
                    age: 17,
                },
            }),
        ).rejects.toThrow(/Too small/);
    });
});
