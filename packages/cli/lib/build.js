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

const writeJSONFile = async (filename, page) => {
  await ensureDir(path.dirname(filename));
  console.log('[@vxapp/json] write file:', filename);
  return writeFile(filename, JSON.stringify(page));
};

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

const createParser = src => {
  return async name => {
    const json =  path.resolve(src, `${name}.json`);
    const config = await readJSONFile(json);
    const def = (prop, value) => 
      Object.defineProperty(config, prop, { value });
    def('json', json);
    def('js', path.resolve(src, `${name}.js`));
    def('wxml', path.resolve(src, `${name}.wxml`));
    def('wxss', path.resolve(src, `${name}.wxss`));
    return config;
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
    await wxjs.transform(Object.assign({ current: page.js }, options));
    await wxml.transform(Object.assign({ current: page.wxml }, options));
    await wxss.transform(Object.assign({ current: page.wxss }, options));
    writeJSONFile(path.join(target, `${entry}.json`), page);
  });
  await writeJSONFile(path.join(target, `app.json`), app);
  await wxjs.transform(Object.assign({ current: app.js }, options));
};

module.exports = build;
