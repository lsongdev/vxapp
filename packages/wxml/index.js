const fs = require('fs');
const xml = require('xml2');
const path = require('path');
const { promisify } = require('util');
const createResolver = require('@vxapp/resolve');

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);

const ensureDir = async dir => {
  const paths = [];
  dir.split(path.sep).reduce((prev, cur) => {
    const result = path.join(prev, cur);
    paths.push(result);
    return result;
  }, path.sep);
  for(const cur of paths){
    const isExists = await exists(cur);
    !isExists && await mkdir(cur);
  }
};

const wxml = options => {
  const resolve = createResolver(options);
  const transform = ast => {
    return {
      import(node){
        const name = node.attributes.src;
        const info = resolve(name);
        wxml.compile(info);
        node.attributes.src = info.relative;
      }
    }
  };
  return transform;
};

wxml.compile = async options => {
  const { current, source, target } = options;
  const output = current.replace(source, target);
  const result = await xml.transformFile(current, {
    selfClosed: [ 'image', 'import' ],
    plugins: [ wxml(options) ]
  });
  await ensureDir(path.dirname(output));
  return writeFile(output, result);
};

module.exports = wxml;