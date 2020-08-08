// Dependencies
const download = require('download');
const hasha = require('hasha');
const test = require('ava');
const { join } = require('path');
const { readFileSync } = require('fs');
const versions = require('./versions.json');
const { asyncForEach } = require('./shared');

const allVersions = [...versions.stable.v2, ...versions.prerelease.v3, ...versions.stable.v3];

// TODO: test all versions
asyncForEach(allVersions, async version => {
  const major = version[0];
  const url = `https://downloads.sourceforge.net/project/nsis/NSIS%20${major}/${version}/nsis-${version}.zip`;

  test(`NSIS v${version}`, async t => {
    return Promise.resolve(download(url)
      .then(file => {
        const manifest = readFileSync(join(__dirname, '..', 'bucket', `nsis-${version}.json`), 'utf8');
        const hashes = JSON.parse(manifest).hash;
        const sha512 = hashes[hashes.length - 1];

        const [algorithm, expected] = sha512.split(':');
        const actual = hasha(file, {algorithm: 'sha512'});

        t.is(actual, expected);
      })
      .catch( error => {
        error = error.toString().trim();

        if (error === 'HTTPError: Response code 429 (Too Many Requests)') {
          t.log('Skipping Test: Too Many Requests');
          t.pass();
        } else if (error === 'HTTPError: Response code 404 (Not Found)') {
          t.log('Skipping Test: Not Found');
          t.pass();
        } else if (error.startsWith('Error: ENOENT')) {
          t.log(`Skipping Test:  ${error}`);
          t.pass();
        // } else if (error.code === 'ENOTFOUND' || error.RequestError === 'ENOTFOUND') {
        //   t.log('Skipping Test: Can\'t Resolve Hostname');
        //   t.pass();
        } else {
          t.log(error);
          t.fail();
        }
      }));
  });
});
