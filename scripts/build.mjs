// Dependencies
import { asyncForEach } from './shared.mjs';
import { renderFile } from 'ejs';
import { sha1 as _sha1, sha256 as _sha256, sha512 as _sha512 } from 'hash-wasm';
import { stable, prerelease } from './versions.mjs';
import { writeFile } from 'fs';
import logSymbols from 'log-symbols';
import MFH from 'make-fetch-happen';
import path from 'path';

const fetch = MFH.defaults({
  cacheManager: '.cache'
});

const __dirname = path.resolve(path.dirname(''));

async function getHash(blob) {
  const data = new Uint32Array(blob)
  const sha1 = await _sha1(data);
  const sha256 = await _sha256(data);
  const sha512 = await _sha512(data);

  const hashes = [
    `sha1:${sha1}`,
    `sha256:${sha256}`,
    `sha512:${sha512}`
  ];

  return hashes;
}

let template = (version, hashes, outFile = null) => {
  const data = {
    version: version,
    majorVersion: version[0],
    hashes: hashes
  };

  renderFile(path.join(__dirname, 'scripts', '/manifest.ejs'), data, function(err, contents) {
    if (err) {
      console.error(logSymbols.error, err);
      return;
    }

    outFile = (outFile !== null) ? outFile : `nsis-${version}.json`;
    outFile = path.join(process.cwd(), 'bucket', outFile);
    contents = JSON.stringify(JSON.parse(contents), null, 4);

    writeFile(outFile, contents, (err) => {
      if (err) throw err;
      console.log(logSymbols.success, `Saved: ${outFile}`);
    });
  });
};

const createManifest = async (version, outFile = null) => {
  const major = version[0];
  const directory = (/\d(a|b|rc)\d*$/.test(version) === true) ? `NSIS%20${major}%20Pre-release` : `NSIS%20${major}`;
  const url = `https://downloads.sourceforge.net/project/nsis/${directory}/${version}/nsis-${version}.zip`;

  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    if (error.statusMessage) {
      if (error.statusMessage === 'Too Many Requests') {
        return console.warn(logSymbols.warning, `${error.statusMessage}: nsis-${version}.zip`);
      }
      return console.error(logSymbols.error, `${error.statusMessage}: nsis-${version}.zip`);
    } else if (error.code === 'ENOENT') {
      return console.log('Skipping Test: Manifest Not Found');
    }
    console.error(logSymbols.error, error);
  }

  const hashes = await getHash(await response.blob())
  template(version, hashes, outFile);
};

const allVersions = [...stable.v2, ...prerelease.v3, ...stable.v3];

// All versions
asyncForEach(allVersions, async (version) => {
  await createManifest(version);
});

(async () => {
  const v2Versions = stable.v2;
  const v3Versions = stable.v3;
  
  await createManifest(v2Versions[v2Versions.length - 1], 'nsis-2.json');
  await createManifest(v3Versions[v3Versions.length - 1], 'nsis.json');
})();
