// Dependencies
import { asyncForEach } from './shared.mjs';
import * as hashWasm from 'hash-wasm';
import MFH from 'make-fetch-happen';
import symbol from 'log-symbols';
import test from 'ava';
import fs from 'fs';
import path from 'path';
import { stable, prerelease } from './versions.mjs';

const fetch = MFH.defaults({
  cacheManager: '.cache'
});

const __dirname = path.resolve(path.dirname(''));

const allVersions = [...stable.v2, ...prerelease.v3, ...stable.v3];

// TODO: test all versions
asyncForEach(allVersions, async version => {
  const major = version[0];
  const url = `https://downloads.sourceforge.net/project/nsis/NSIS%20${major}/${version}/nsis-${version}.zip`;

  await test(`NSIS v${version}`, async t => {
    let response;

    try {
      response = await fetch(url);
    } catch (error) {
      if (error.statusMessage) {
        if (error.statusMessage === 'Too Many Requests') {
          return t.log(symbol.warning, `${error.statusMessage}: nsis-${version}.zip`);
        }
        return t.log(symbol.error, `${error.statusMessage}: nsis-${version}.zip`);
      } else if (error.code === 'ENOENT') {
        return t.log('Skipping Test: Manifest Not Found');
      }
      t.log(symbol.error, error);
    }

    const manifest = fs.readFileSync(path.join(__dirname, 'bucket', `nsis-${version}.json`), 'utf8');
    const hashes = JSON.parse(manifest).hash;
    const sha512 = hashes[hashes.length - 1];

    const actual = await hashWasm.sha512(new Uint32Array(await response.blob()))
    const [, expected] = sha512.split(':');

    t.is(actual, expected);

  });
});
