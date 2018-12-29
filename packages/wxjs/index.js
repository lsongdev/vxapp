const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const babel = require('@babel/core');
const createResolver = require('@vxapp/resolve');

const readFile = promisify(fs.readFile);
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

const moduelResolver = rewriter => {
  return ({
    visitor: {
      CallExpression({ node }){
        if (node.callee.name === 'require') {
          const { value } = node.arguments[0];
          node.arguments[0].value = rewriter(value);
        }
      }
    }
  });
};

const wxjs = options => {
  const resolve = createResolver(options);
  return moduelResolver(name => {
    const info = resolve(name);
    wxjs.transform(info);
    return info.relative;
  });
};

wxjs.transform = async options => {
  const { current, source, target, plugins = [] } = options;
  const output = options.output || current.replace(source, target);
  const content = await readFile(current);
  const result = babel.transform(content, {
    plugins: plugins.concat(wxjs(options))
  });
  await ensureDir(path.dirname(output));
  await writeFile(output, result.code);
  console.log('[@vxapp/wxjs] write file:', output);
};

module.exports = wxjs;