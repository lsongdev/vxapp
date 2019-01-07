const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const createResolver = require('@vxapp/resolve');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const writeJSONFile = async (filename, obj) => {
  await ensureDir(path.dirname(filename));
  console.log('[@vxapp/json] write file:', filename);
  return writeFile(filename, JSON.stringify(obj));
};

const readJSONFile = (filename, encoding = 'utf8') => 
  readFile(filename, encoding).then(JSON.parse);

const safeJSONFile = async filename => {
  var obj = {};
  try{
    obj = await readJSONFile(filename);
  }catch(e){}
  return obj;
}

const ensureDir = dir => {
  const paths = [];
  dir.split(path.sep).reduce((prev, cur) => {
    const result = path.join(prev, cur);
    paths.push(result);
    try{
      fs.mkdirSync(result);
    }catch(e){}
    return result;
  }, path.sep);
};


const json = () => {

};

json.transform = async options => {
  const { current, source, target } = options;
  const output = options.output || current.replace(source, target);
  const resolve = createResolver(options);
  const entry = await safeJSONFile(current);
  for(const componentName of Object.keys(entry.usingComponents || {})){
    const component = entry.usingComponents[componentName];
    const ref = resolve(component);
    console.log(output, ref);
  }
  return writeJSONFile(output, entry);
};

json.createParser = src => {
  return async name => {
    const json =  path.resolve(src, `${name}.json`);
    const config = await safeJSONFile(json);
    const def = (prop, value) => 
      Object.defineProperty(config, prop, { value });
    def('name', name);
    def('json', json);
    def('js', path.resolve(src, `${name}.js`));
    def('wxml', path.resolve(src, `${name}.wxml`));
    def('wxss', path.resolve(src, `${name}.wxss`));
    return config;
  };
};

module.exports = json;