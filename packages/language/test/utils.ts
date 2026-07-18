import { invariant } from '@zenstackhq/common-helpers';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect } from 'vitest';
import { loadDocument } from '../src';

const pluginDocs = [path.resolve(__dirname, '../../plugins/policy/plugin.zmodel')];

export async function loadSchema(schema: string) {
    // create a temp file
    const tempFile = path.join(os.tmpdir(), `zenstack-schema-${crypto.randomUUID()}.zmodel`);
    fs.writeFileSync(tempFile, schema);
    const r = await loadDocument(tempFile, pluginDocs);
    expect(r).toSatisfy(
        (r) => r.success,
        `Failed to load schema: ${(r as any).errors?.map((e) => e.toString()).join(', ')}`,
    );
    invariant(r.success);
    return r.model;
}

export async function loadSchemaWithError(schema: string, error: string | RegExp) {
    // create a temp file
    const tempFile = path.join(os.tmpdir(), `zenstack-schema-${crypto.randomUUID()}.zmodel`);
    fs.writeFileSync(tempFile, schema);

    const r = await loadDocument(tempFile, pluginDocs);
    expect(r.success).toBe(false);
    invariant(!r.success);
    if (typeof error === 'string') {
        expect(r).toSatisfy(
            (r) => r.errors.some((e) => e.toString().toLowerCase().includes(error.toLowerCase())),
            `Expected error message to include "${error}" but got: ${r.errors.map((e) => e.toString()).join(', ')}`,
        );
    } else {
        expect(r).toSatisfy(
            (r) => r.errors.some((e) => error.test(e)),
            `Expected error message to match "${error}" but got: ${r.errors.map((e) => e.toString()).join(', ')}`,
        );
    }
}

export async function loadSchemaWithWarning(schema: string, warning: string | RegExp) {
    // create a temp file
    const tempFile = path.join(os.tmpdir(), `zenstack-schema-${crypto.randomUUID()}.zmodel`);
    fs.writeFileSync(tempFile, schema);

    const r = await loadDocument(tempFile, pluginDocs);
    expect(r.success).toBe(true);
    invariant(r.success);
    if (typeof warning === 'string') {
        expect(r).toSatisfy(
            (r) => r.warnings.some((w) => w.toString().toLowerCase().includes(warning.toLowerCase())),
            `Expected warning message to include "${warning}" but got: ${r.warnings.map((w) => w.toString()).join(', ')}`,
        );
    } else {
        expect(r).toSatisfy(
            (r) => r.warnings.some((w) => warning.test(w)),
            `Expected warning message to match "${warning}" but got: ${r.warnings.map((w) => w.toString()).join(', ')}`,
        );
    }
}
