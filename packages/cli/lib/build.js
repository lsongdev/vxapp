const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const wxml = require('@vxapp/wxml');
const wxss = require('@vxapp/wxss');
const wxjs = require('@vxapp/wxjs');

const root = process.cwd();
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readJSONFile = (filename, encoding = 'utf8') => 
  readFile(filename, encoding).then(JSON.parse);

const writeJSONFile = (filename, page) => {
  console.log('[@vxapp/json] write file:', filename);
  return writeFile(filename, JSON.stringify(page));
};

const createParser = src => {
  return async name => {
    const filename = path.join(src, `${name}.json`);
    return readJSONFile(filename);
  };
};

const build = async (source = 'src', target = 'dist') => {
  source = path.resolve(root, source);
  target = path.resolve(root, target);
  const options = { source, target };
  const parse = createParser(source);
  const app = await parse('app');
  app.pages.forEach(async entry => {
    const page = await parse(entry);
    await wxjs.compile(Object.assign({}, options, { current: path.resolve(source, `${entry}.js`) }));
    await wxml.compile(Object.assign({}, options, { current: path.resolve(source, `${entry}.wxml`) }));
    await wxss.compile(Object.assign({}, options, { current: path.resolve(source, `${entry}.wxss`) }));
    writeJSONFile(path.join(target, `${entry}.json`), page);
  });
};

module.exports = build;