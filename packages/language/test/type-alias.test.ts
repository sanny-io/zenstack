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
                    id    String @id
                    name  UserName
                    name2 UserName
                }

                type UserName extends String {
                    this String @onlyOnce
                }

                attribute @onlyOnce() @@@targetField([StringField]) @@@onceInModel @@@validation
            `,
            'can only be applied to one field per model',
        );
    });

    it('resolves `this` to the base type', async () => {
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

    it('rejects invalid attributes', async () => {
        await loadSchemaWithError(
            `
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
            `,
            'attribute "@db.Text" cannot be used with type aliases',
        );

        await loadSchemaWithError(
            `
                datasource db {
                    provider = 'postgresql'
                    url      = 'file:./dev.db'
                }

                model User {
                    id    String @id
                    email Email @gt(5)
                }

                type Email extends String {
                    this String
                }
            `,
            'cannot be used on this type of field',
        );
    });

    it('accepts attributes on the field declaration', async () => {
        await loadSchema(`
                datasource db {
                    provider = 'postgresql'
                    url      = 'file:./dev.db'
                }

                model User {
                    id    String @id
                    email Email @length(1, 2) @db.Text
                }

                type Email extends String {
                    this String
                }
            `);
    });

    it('accepts attributes on the `this` declaration', async () => {
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
                    this String @email
                }
            `);
    });
});
