// Dependencies
const download = require('download');
const test = require('ava');
const hasha = require('hasha');
const { join } = require('path');
const { versions } = require('./versions.json');
const { readFileSync } = require('fs');

versions.forEach( version => {
  const major = version[0];
  const url = `https://downloads.sourceforge.net/project/nsis/NSIS%20${major}/${version}/nsis-${version}.zip`;

  test(`NSIS v${version}`, t => {
    return Promise.resolve(download(url)
      .then(file => {
        const manifest = readFileSync(join(__dirname, '..', `nsis-${version}.json`), 'utf8');
        const hashes = JSON.parse(manifest).hash;
        const sha512 = hashes[hashes.length - 1];

        const [algorithm, expected] = sha512.split(':');
        const actual = hasha(file, {algorithm: 'sha512'});

        t.is(actual, expected);
      })
      .catch( error => {
        if (error.statusMessage) {
          t.log(`Skipping Test: ${error.statusMessage}`);
          t.pass();
        } else if (error.code === 'ENOENT') {
          t.log('Skipping Test: Manifest Not Found');
          t.pass();
        } else {
          t.fail();
        }
      }));
  });
});
