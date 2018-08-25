// Dependencies
const download = require('download');
const test = require('ava');
const hasha = require('hasha');
const { join } = require('path');
const { versions } = require('./versions.json');
const { readFileSync } = require('fs');

let returnHash = (blob) => {
    return hasha(blob);
};


versions.forEach( version => {
    const major = version[0];
    const url = `https://downloads.sourceforge.net/project/nsis/NSIS%20${major}/${version}/nsis-${version}.zip`;


    test(`NSIS v${version}`, t => {

      return Promise.resolve(download(url)
      .then(file => {
        const manifest = readFileSync(join(__dirname, '..', `nsis-${version}.json`), 'utf8');

        const actual = hasha(file, {algorithm: 'sha256'});
        const expected = JSON.parse(manifest).hash[0];

        t.is(actual, expected);
      })
      .catch( error => {
          if (error.statusMessage) {
            t.log(`Skipping Test: ${error.statusMessage}`);
            t.pass();
          } else if (error.code === 'ENOENT') {
            t.log(`Skipping Test: Manifest Not Found`);
            t.pass();
          } else {
            t.fail();
          }
      }));
    });
});
