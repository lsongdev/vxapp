const fs = require('fs');
const path = require('path');

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

const createResolver = ({ source, target, current }) => {
  const context = path.dirname(current);
  const filename = current.replace(source, target);
  return name => {
    const ref = require.resolve(name, { paths: [context] });
    var output = ref.replace(source, target);
    if(~ref.indexOf('node_modules')){
      const dir = getModulePath(ref);
      const pkg = require(path.join(dir, 'package.json'));
      const npm = path.join(out, 'npm', `${pkg.name}-${pkg.version}`);
      output = ref.replace(dir, npm);
    }
    return {
      source,
      target,
      output,
      current: ref,
      relative: relative(filename, output)
    };
  }
};

module.exports = createResolver;