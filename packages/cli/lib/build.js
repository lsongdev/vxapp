const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const wxml = require('@vxapp/wxml');
const wxss = require('@vxapp/wxss');
const wxjs = require('@vxapp/wxjs');

const root = process.cwd();
// readFile
const readFile = promisify(fs.readFile);
const readJSONFile = (filename, encoding = 'utf8') => 
  readFile(filename, encoding).then(JSON.parse);

const build = async (src, out) => {
  src = src || path.join(root, 'src');
  out = out || path.join(root, 'dist');
  const appFile = path.join(src, 'app.json');
  if(!fs.existsSync(appFile)){
    return console.error('[@vxapp/cli] app.json does not exists.');
  }
  const { pages } = await readJSONFile(appFile);
  const entries = [ 'app' ].concat(pages);
  entries.forEach(entry => {
    wxjs(src, out)(path.join(src, `${entry}.js`));
    wxss(src, out)(path.join(src, `${entry}.css`));
    wxml(src, out)(path.join(src, `${entry}.wxml`));
  });
};

module.exports = build;