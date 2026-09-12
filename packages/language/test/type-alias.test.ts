import { describe, it } from 'vitest';
import { loadSchema, loadSchemaWithError } from './utils';

describe('Type alias tests', () => {
    it('supports type aliases', async () => {
        await loadSchema(`
                datasource db {
                    provider = 'sqlite'
                    url      = 'file:./dev.db'
                }

                model User {
                    id   Int   @id
                    name UserName
                }

                type UserName extends String {
                    this String
                }
            `);
    });

    it('supports type aliases in validation', async () => {
        await loadSchema(`
                datasource db {
                    provider = 'sqlite'
                    url      = 'file:./dev.db'
                }

                model User {
                    id   Int   @id
                    age  Age

                    @@validate(age >= 18)
                }

                type Age extends Int {
                    this Int
                }
            `);
    });

    it('supports type aliases with default values', async () => {
        await loadSchema(`
                datasource db {
                    provider = 'sqlite'
                    url      = 'file:./dev.db'
                }

                model User {
                    id   String @id
                    name UserName @default('')
                }

                type UserName extends String {
                    this String
                }
            `);
    });

    it('detects duplicate attributes', async () => {
        await loadSchemaWithError(
            `
                datasource db {
                    provider = 'sqlite'
                    url      = 'file:./dev.db'
                }

                model User {
                    id   String   @id
                    name UserName @default('')
                }

                type UserName = String @default('')
            `,
            'can only be applied once',
        );

        await loadSchemaWithError(
            `
                datasource db {
                    provider = 'sqlite'
                    url      = 'file:./dev.db'
                }

                model User {
                    id    String @id
                    name  UserName
                    name2 UserName
                }

                type UserName = String @onlyOnce

                attribute @onlyOnce() @@@targetField([StringField]) @@@onceInModel
            `,
            'can only be applied to one field per model',
        );
    });

    it('rejects invalid attribute applications', async () => {
        await loadSchemaWithError(
            `
                datasource db {
                    provider = 'sqlite'
                    url      = 'file:./dev.db'
                }

                model User {
                    id   String   @id
                    test Test
                }

                type Test = String @unique
            `,
            'cannot be used on this type of field',
        );

        await loadSchemaWithError(
            `
                datasource db {
                    provider = 'sqlite'
                    url      = 'file:./dev.db'
                }

                model User {
                    id   String   @id
                    test Test
                }

                type Test = String @db.Text
            `,
            'cannot be used on this type of field',
        );
    });

    it('testt', async () => {
        await loadSchema(`
                datasource db {
                    provider = 'sqlite'
                    url      = 'file:./dev.db'
                }

                model User {
                    id    String @id
                    email Email
                }

                type Email extends String {
                    this String

                    @@validate(isEmail(this))
                }
            `);
    });

    it('testt 222', async () => {
        await loadSchema(`
                datasource db {
                    provider = 'postgresql'
                    url      = 'file:./dev.db'
                }

                model User {
                    id    String @id
                    email Email
                }

                type Email extends String {
                    this String @db.Text
                }
            `);
    });

    it('testt 222234', async () => {
        await loadSchema(`
                datasource db {
                    provider = 'postgresql'
                    url      = 'file:./dev.db'
                }

                model User {
                    id    String @id
                    email Email @length(1, 2)
                }

                type Email extends String {
                    this String
                }
            `);
    });
});
