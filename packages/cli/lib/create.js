const fs = require('fs');
const tar = require('tar');
const path = require('path');
const upkg = require('upkg');
const zlib = require('zlib');
const https = require('https');

const root = process.cwd();
const ensureDir = dir => {
  const paths = [];
  dir.split(path.sep).reduce((prev, cur) => {
    const result = path.join(prev, cur);
    paths.push(result);
    try{
      fs.mkdirSync(result);
    }catch(e){
      // console.log(e.code, result);
    }
    return result;
  }, path.sep);
};

const create = async (projectName, options) => {
  const { template = '@vxapp/demo' } = options;
  if(!projectName) return console.error('[@vxapp/cli] project name is required');
  const npm = new upkg(options);
  const pkg = await npm.fetch(template);
  const version = pkg['dist-tags']['latest'];
  const info = pkg.versions[version];
  await ensureDir(path.join(root, projectName));
  https.get(info.dist.tarball, res => {
    res
    .pipe(zlib.createGunzip())
    .pipe(tar.t())
    .on('entry', entry => {
      const filename = path.join(root, entry.header.path.replace(/^package/, projectName));
      ensureDir(path.dirname(filename));
      console.log('[@vxapp/cli] >', entry.header.path);
      entry.pipe(fs.createWriteStream(filename));
    })
    .on('end', () => console.log('[@vxapp/cli] > create project:', projectName));
  });
};

module.exports = create;