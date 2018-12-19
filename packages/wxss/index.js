const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const { promisify } = require('util');
const createResolver = require('@vxapp/resolve');

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
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

const atImport = rewriter => {
  return root => {
    root.walkAtRules('import', rule => {
      rule.params = rewriter(JSON.parse(rule.params));
    });
  };
};

const wxss = options => {
  const resolve = createResolver(options);
  return atImport(name => {
    const info = resolve(name);
    wxss.transform(info);
    return `"${info.relative}"`;
  });
};

wxss.transform = async options => {
  const { current, source, target, plugins = [] } = options;
  const output = current.replace(source, target);
  const content = await readFile(current);
  const parse = postcss(plugins.concat(wxss(options)));
  const result = parse.process(content, { from: current, to: output });
  await ensureDir(path.dirname(output));
  await writeFile(output, result.css);
  console.log('[@vxapp/wxss] write file:', output);
};

module.exports = wxss;