const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const wxml = require('@vxapp/wxml');
const wxss = require('@vxapp/wxss');
const wxjs = require('@vxapp/wxjs');

const root = process.cwd();
const readFile = promisify(fs.readFile);
const readJSONFile = (filename, encoding = 'utf8') => 
  readFile(filename, encoding).then(JSON.parse);

const createParser = src => {
  return async name => {
    const filename = path.join(src, `${name}.json`);
    return readJSONFile(filename);
  };
};

const build = async (src, out) => {
  src = src || path.join(root, 'src');
  out = out || path.join(root, 'dist');
  const _wxjs = wxjs(src, out);
  const _wxss = wxss(src, out);
  const _wxml = wxml(src, out);
  const parse = createParser(src);
  const app = await parse('app');
  app.pages.forEach(async entry => {
    const page = await parse(entry);
    _wxjs(path.join(src, `${entry}.js`));
    _wxss(path.join(src, `${entry}.wxss`));
    _wxml(path.join(src, `${entry}.wxml`));
  });
};

module.exports = build;