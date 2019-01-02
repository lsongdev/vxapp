const fs = require('fs');
const xml = require('xml2');
const path = require('path');
const { promisify } = require('util');
const createResolver = require('@vxapp/resolve');

const writeFile = promisify(fs.writeFile);
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

const moduleResolver = rewriter => {
  const transform = ast => {
    return {
      import(node){
        const name = node.attributes.src;
        node.attributes.src = rewriter(name);
      },
      include(node){
        const name = node.attributes.src;
        node.attributes.src = rewriter(name);
      },
      image(node){
        const name = node.attributes.src;
        node.attributes.src = rewriter(name);
      }
    }
  };
  return transform;
};

const wxml = options => {
  const resolve = createResolver(Object.assign({
    extensions: [ '.wxml', '' ]
  }, options));
  return moduleResolver(name => {
    const info = resolve(name);
    wxml.transform(info);
    return info.relative;
  });
};

wxml.transform = async options => {
  var { current, source, target, output } = options;
  output = output || current.replace(source, target);
  const result = await xml.transformFile(current, {
    selfClosed: [ 'image', 'import', 'include' ],
    plugins: [ wxml(options) ]
  });
  await ensureDir(path.dirname(output));
  await writeFile(output, result);
  console.log('[@vxapp/wxml] write file:', output);
};

module.exports = wxml;