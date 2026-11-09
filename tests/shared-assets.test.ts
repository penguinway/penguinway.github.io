import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const script = path.resolve('scripts/sync-assets.mjs');
async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'solitude-assets-'));
  const source = path.join(root, 'astro-solitude');
  const hexo = path.join(root, 'hexo-theme-solitude');
  const hugo = path.join(root, 'solitude');
  await Promise.all([
    fs.mkdir(path.join(source, 'docs'), { recursive: true }),
    fs.mkdir(hexo),
    fs.mkdir(hugo),
  ]);
  await fs.mkdir(path.join(source, 'public/img'), { recursive: true });
  const bytes = Buffer.from('test asset');
  await fs.writeFile(path.join(source, 'public/img/logo.png'), bytes);
  const manifest = {
    version: 1,
    assets: [
      {
        source: 'public/img/logo.png',
        sha256: createHash('sha256').update(bytes).digest('hex'),
        targets: {
          astro: 'public/img/logo.png',
          hexo: 'source/img/logo.png',
          hugo: 'static/img/logo.png',
        },
      },
    ],
    removals: {
      astro: [] as string[],
      hexo: ['obsolete.png'],
      hugo: [] as string[],
    },
  };
  const save = () =>
    fs.writeFile(
      path.join(source, 'docs/shared-assets.json'),
      JSON.stringify(manifest),
    );
  await save();
  const run = (...args: string[]) =>
    spawnSync(process.execPath, [script, '--source-root', source, ...args], {
      encoding: 'utf8',
    });
  return { root, source, hexo, hugo, manifest, save, run };
}

test('preview is read-only; sync is idempotent and reports missing/changed assets', async () => {
  const f = await fixture();
  try {
    await fs.writeFile(path.join(f.hexo, 'obsolete.png'), 'old');
    await fs.writeFile(path.join(f.hexo, 'personal.png'), 'keep');
    assert.equal(f.run().status, 0);
    assert.equal(
      await fs.readFile(path.join(f.hexo, 'obsolete.png'), 'utf8'),
      'old',
    );
    await assert.rejects(fs.access(path.join(f.hexo, 'source/img/logo.png')));
    assert.equal(f.run('--check').status, 1);
    assert.equal(f.run('--write').status, 0);
    assert.equal(f.run('--write').stdout.includes('0 changes applied'), true);
    assert.equal(f.run('--check').status, 0);
    assert.equal(
      await fs.readFile(path.join(f.hexo, 'personal.png'), 'utf8'),
      'keep',
    );
    await assert.rejects(fs.access(path.join(f.hexo, 'obsolete.png')));
    await fs.writeFile(path.join(f.hexo, 'source/img/logo.png'), 'changed');
    const drift = f.run('--check');
    assert.equal(drift.status, 1);
    assert.match(drift.stdout, /update hexo\/source\/img\/logo.png/);
    await fs.unlink(path.join(f.hugo, 'static/img/logo.png'));
    assert.match(f.run('--check').stdout, /add hugo\/static\/img\/logo.png/);
    assert.equal(f.run('--write', '--project', 'hexo').status, 0);
    assert.equal(f.run('--check', '--project', 'hexo').status, 0);
    assert.equal(f.run('--check', '--project', 'hugo').status, 1);
  } finally {
    await fs.rm(f.root, { recursive: true, force: true });
  }
});

test('source hash failures abort all writes and deletions', async () => {
  const f = await fixture();
  try {
    await fs.writeFile(path.join(f.hexo, 'obsolete.png'), 'old');
    await fs.writeFile(
      path.join(f.source, 'public/img/logo.png'),
      'edited source',
    );
    const result = f.run('--write');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Source hash mismatch/);
    await assert.rejects(fs.access(path.join(f.hexo, 'source')));
    assert.equal(
      await fs.readFile(path.join(f.hexo, 'obsolete.png'), 'utf8'),
      'old',
    );
  } finally {
    await fs.rm(f.root, { recursive: true, force: true });
  }
});

test('unsafe paths, symlinks and invalid mode combinations abort before writes', async () => {
  const f = await fixture();
  try {
    f.manifest.removals.hugo.push('../outside.png');
    await f.save();
    assert.match(f.run('--write').stderr, /Unsafe manifest path/);
    await assert.rejects(fs.access(path.join(f.hexo, 'source')));
    f.manifest.removals.hugo = [];
    await f.save();
    const outside = path.join(f.root, 'outside');
    await fs.mkdir(outside);
    await fs.symlink(outside, path.join(f.hexo, 'source'));
    assert.match(f.run('--write').stderr, /Refusing symlink/);
    assert.deepEqual(await fs.readdir(outside), []);
    assert.equal(f.run('--check', '--write').status, 1);
    assert.equal(f.run('--project', 'unknown').status, 1);
  } finally {
    await fs.rm(f.root, { recursive: true, force: true });
  }
});
