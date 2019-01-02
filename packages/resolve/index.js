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
  return e.indexOf('.') === 0 ? e : `./${e}`;
};

const getPaths = dir => {
  const paths = [ dir ];
  dir.split(path.sep).reduce((prev, curr) => {
    const p = path.join(prev, curr);
    paths.push(path.join(p, 'node_modules'));
    return p;
  }, path.sep);
  return paths.reverse();
};

const fileWithExtension = (id, extensions) => {
  return extensions.map(ext => id + ext);
};

const stat = filename => {
  try{
    return fs.statSync(filename);
  }catch(e){
    return null;
  }
};

const readPackage = dir => {
  const filename = path.join(dir, 'package.json');
  return stat(filename) && require(filename);
};

const resolve = (id,  options = {}) => {
  const { 
    basedir = process.cwd(), 
    paths = getPaths(basedir),
    extensions = ['.js', '']
  } = options;
  const filenames = paths.reduce((filenames, p) => {
    return filenames.concat(fileWithExtension(path.join(p, id), extensions));
  }, []);
  for(const filename of filenames){
    const s = stat(filename);
    if(s === null) continue;
    if(s.isDirectory()){
      const pkg = readPackage(filename);
      filenames.push.apply(filenames, 
        extensions.map(ext => {
          const main = (pkg ? pkg.main : 'index');
          return path.join(filename, main + ext);
        })
      );
    } else {
      return filename;
    }
  }
};

const getOutputFileName = (filename, { source, target }) => {
  var output = filename.replace(source, target);
  if(~filename.indexOf('node_modules')){
    const dir = getModulePath(filename);
    const pkg = require(path.join(dir, 'package.json'));
    const npm = path.join(target, 'npm', `${pkg.name}-${pkg.version}`);
    output = filename.replace(dir, npm);
  }
  return output;
};

const createResolver = ({ source, target, current, extensions }) => {
  const basedir = path.dirname(current);
  const filename = getOutputFileName(current, { source, target });
  return name => {
    const ref = resolve(name, { basedir, extensions });
    if(!ref) throw new Error(`[@vxapp/resolve] can not found module: "${name}" `);
    const output = getOutputFileName(ref, { source, target });
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