// Dependencies
const download = require('download');
const ejs = require('ejs');
const hasha = require('hasha');
const symbol = require('log-symbols');
const { join } = require('path');
const versions = require('./versions.json');
const { writeFile } = require('fs');
const { asyncForEach } = require('./shared');

let getHash = (blob) => {
  const sha1 = hasha(blob, {algorithm: 'sha1'});
  const sha256 = hasha(blob, {algorithm: 'sha256'});
  const sha512 = hasha(blob, {algorithm: 'sha512'});

  const hashes = [
    `sha1:${sha1}`,
    `sha256:${sha256}`,
    `sha512:${sha512}`
  ];

  return hashes;
};

let template = (version, hashes, outFile = null) => {
  const data = {
    version: version,
    majorVersion: version[0],
    hashes: hashes
  };

  ejs.renderFile(join(__dirname, '/manifest.ejs'), data, function(err, contents) {
    if (err) {
      console.error(symbol.error, err);
      return;
    }

    outFile = (outFile !== null) ? outFile : `nsis-${version}.json`;
    outFile = join(process.cwd(), 'bucket', outFile);
    contents = JSON.stringify(JSON.parse(contents), null, 4);

    writeFile(outFile, contents, (err) => {
      if (err) throw err;
      console.log(symbol.success, `Saved: ${outFile}`);
    });
  });
};

const createManifest = async (version, outFile = null) => {
  const major = version[0];
  const directory = (/\d(a|b|rc)\d*$/.test(version) === true) ? `NSIS%20${major}%20Pre-release` : `NSIS%20${major}`;
  const url = `https://downloads.sourceforge.net/project/nsis/${directory}/${version}/nsis-${version}.zip`;

  await download(url)
    .then(getHash)
    .then(hashes => {
      return template(version, hashes, outFile);
    })
    .catch( error => {
      if (error.statusMessage) {
        if (error.statusMessage === 'Too Many Requests') {
          return console.warn(symbol.warning, `${error.statusMessage}: nsis-${version}.zip`);
        }
        return console.error(symbol.error, `${error.statusMessage}: nsis-${version}.zip`);
      } else if (error.code === 'ENOENT') {
        return console.log('Skipping Test: Manifest Not Found');
      }
      console.error(symbol.error, error);
    });
};

const allVersions = [...versions.stable.v2, ...versions.prerelease.v3, ...versions.stable.v3];

// All versions
asyncForEach(allVersions, async (version) => {
  await createManifest(version);
});
