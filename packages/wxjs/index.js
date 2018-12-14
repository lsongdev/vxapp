const path = require('path');
const fs = require('fs-extra');
const babel = require('@babel/core');

const createTransformer = (src, out, options = {}) => {
  const { plugins = [] } = options;
  return async function transform(input, output) {
    output = output || input.replace(src, out);
    if(!await fs.exists(input))
      return console.error('[@vxapp/wxjs] file does not exists:', input);
    const context = path.dirname(input);
    const source = await fs.readFile(input);
    const resolver = moduelResolver(name => {
      const ref = require.resolve(name, { paths: [context] });
      var to = ref.replace(src, out);
      if(~ref.indexOf('node_modules')){
        const dir = getModulePath(ref);
        const pkg = require(path.join(dir, 'package.json'));
        const npm = path.join(out, 'npm', `${pkg.name}-${pkg.version}`);
        to = ref.replace(dir, npm);
      }
      transform(ref, to);
      return relative(output, to);
    });
    const result = babel.transform(source, {
      plugins: plugins.concat(resolver)
    });
    await fs.ensureDir(path.dirname(output));
    await fs.writeFile(output, result.code);
    console.log('[@vxapp/wxjs] write file:', output);
  }
};

module.exports = createTransformer;

const getModulePath = name => {
  let dir = path.resolve(name);
  do {
    dir = path.dirname(dir);
    const manifest =  path.join(dir, 'package.json');
    if (fs.existsSync(manifest)) return dir;
  } while (dir !== '.' && dir !== '/');
  return dir;
};

const relative = (from, to) => {
  const a = path.dirname(from);
  const b = path.dirname(to);
  const c = path.relative(a, b);
  const d = path.basename(to);
  const e = path.join(c, d);
  return e;
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
