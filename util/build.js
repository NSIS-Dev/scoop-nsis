// Dependencies
const download = require('download');
const ejs = require('ejs');
const hasha = require('hasha');
const symbol = require('log-symbols');
const { join } = require('path');
const { versions } = require('./versions.json');
const { writeFile } = require('fs');

let getHash = (blob) => {
  const sha1 = hasha(blob, {algorithm: 'sha1'});
  const sha256 = hasha(blob, {algorithm: 'sha256'});
  const sha512 = hasha(blob, {algorithm: 'sha512'});
  const md5 = hasha(blob, {algorithm: 'md5'});

  const hashes = [
    `md5:${md5}`,
    `sha1:${sha1}`,
    `sha256:${sha256}`,
    `sha512:${sha512}`
  ];

  return hashes;
};

let template = (version, hashes) => {
  const data = {
    version: version,
    majorVersion: version[0],
    hashes: hashes
  }
  ejs.renderFile(join(__dirname, '/manifest.ejs'), data, function(err, contents) {
    if (err) {
        console.error(symbol.error, err);
        return;
    }

    const outFile = `nsis-${version}.json`;
    contents = JSON.stringify(JSON.parse(contents), null, 4);

    writeFile(outFile, contents, (err) => {
      if (err) throw err;
      console.log(symbol.success, `Saved nsis-${version}.json`);
    });
})
};

versions.forEach( version => {
  const major = version[0];
  const directory = (/\d(a|b|rc)\d*$/.test(version) === true) ? `NSIS%20${major}%20Pre-release` : `NSIS%20${major}`;
  const url = `https://downloads.sourceforge.net/project/nsis/${directory}/${version}/nsis-${version}.zip`;

  download(url)
  .then(getHash)
  .then(hashes => {
    return template(version, hashes);
  })
  .catch( error => {
    if (error.statusMessage) {
      if (error.statusMessage === 'Too Many Requests') {
        return console.warn(symbol.warning, `${error.statusMessage}: nsis-${version}.zip`);
      }
      return console.error(symbol.error, `${error.statusMessage}: nsis-${version}.zip`);
    }
    console.error(symbol.error, error);
  });
});
