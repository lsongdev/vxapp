const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const { promisify } = require('util');
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

const atImport = rewriter => {
  return root => {
    root.walkAtRules('import', rule => {
      rule.params = rewriter(JSON.parse(rule.params));
    });
  };
};

const wxss = options => {
  const resolve = createResolver(Object.assign({
    extensions: [ '.wxss', '' ]
  }, options));
  return atImport(name => {
    const info = resolve(name);
    wxss.transform(info);
    return `"${info.relative}"`;
  });
};

wxss.transform = async options => {
  var { current, source, target, output, plugins = [] } = options;
  output = output || current.replace(source, target);
  const content = await readFile(current);
  const parse = postcss(plugins.concat(wxss(options)));
  const result = parse.process(content, { from: current, to: output });
  await ensureDir(path.dirname(output));
  await writeFile(output, result.css);
  console.log('[@vxapp/wxss] write file:', output);
};

module.exports = wxss;