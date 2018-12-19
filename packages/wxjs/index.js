const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const babel = require('@babel/core');

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
    wxjs.compile(info);
    return info.relative;
  });
};

wxjs.compile = async options => {
  const { current, source, target, plugins = [] } = options;
  const output = current.replace(source, target);
  const content = await readFile(input);
  const result = babel.transform(content, {
    plugins: plugins.concat(wxjs)
  });
  await ensureDir(path.dirname(output));
  await writeFile(output, result.code);
  console.log('[@vxapp/wxjs] write file:', output);
};

module.exports = wxjs;