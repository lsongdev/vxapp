const fs = require('fs');
const path = require('path');

const wxml = require('@vxapp/wxml');
const wxss = require('@vxapp/wxss');
const wxjs = require('@vxapp/wxjs');
const json = require('@vxapp/json');

const root = process.cwd();
const exists = fs.existsSync;

const createTransformer = options => {
  const f = current => Object.assign({ current }, options);
  const transform = async (entry, { app = false } = {}) => {
    if(exists(entry.wxss))
      await wxss.transform(f(entry.wxss));
    if(exists(entry.json))
      await json.transform(f(entry.json));
    if(app === false)
      await wxml.transform(f(entry.wxml));
    return wxjs.transform(f(entry.js));
  };
  return transform;
};

const build = async (source = 'src', target = 'dist') => {
  source = path.resolve(root, source);
  target = path.resolve(root, target);
  const options = { source, target };
  const parse = json.createParser(source);
  const transform = createTransformer(options);
  const app = await parse('app');
  for(const entry of app.pages){
    const page = await parse(entry);
    transform(page);
  }
  return transform(app, { app: true });
};

module.exports = build;
