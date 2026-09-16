import { describe, it } from 'vitest';
import { loadSchema, loadSchemaWithError } from './utils';

describe('Custom type primitive tests', () => {
    it('supports custom type primitives', async () => {
        await loadSchema(`
                datasource db {
                    provider = 'sqlite'
                    url      = 'file:./dev.db'
                }

                model User {
                    id   Int   @id
                    name UserName
                }

                type UserName with String {
                    this String
                }
            `);
    });

    it('supports custom type primitives in validation', async () => {
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

                type Age with Int {
                    this Int
                }
            `);
    });

    it('supports custom type primitives with default values', async () => {
        await loadSchema(`
                datasource db {
                    provider = 'sqlite'
                    url      = 'file:./dev.db'
                }

                model User {
                    id   String @id
                    name UserName @default('')
                }

                type UserName with String {
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

                type UserName with String {
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

                type Email with String {
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

                type Email with String {
                    this String @db.Text
                }
            `,
            'attribute "@db.Text" cannot be used with primitive type defs',
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

                type Email with String {
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

                type Email with String {
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

                type Email with String {
                    this String @email
                }
            `);
    });
});
