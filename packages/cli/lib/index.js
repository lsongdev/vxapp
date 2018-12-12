const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const babylon = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const root = process.cwd();
// readFile
const readFile = promisify(fs.readFile);
const readJSONFile = (filename, encoding = 'utf8') => 
  readFile(filename, encoding).then(JSON.parse);

const start = async (src, out) => {
  const resolve = f => path.join(src, f);
  const appFile = resolve('app.json');
  const { pages } = await readJSONFile(appFile);
  const entries = [ 'app' ].concat(pages);
  const javascripts = entries.map(entry => resolve(`${entry}.js`));
  const stylesheets = entries.map(entry => resolve(`${entry}.css`));
  const templates = entries.map(entry => resolve(`${entry}.wxml`));
  
  return Promise.all(javascripts.map(script => analyze(script)));
};

const analyze = async filename => {
  const source = await readFile(filename, 'utf8');
  const ast = babylon.parse(source, {
    sourceType: 'module',
  });
  const resolveModule = name => {
    const dir = path.dirname(filename);
    return require.resolve(name, { paths: [dir] });
  };
  traverse(ast, {
    Program: {
      exit(){
        console.log('done');
      }
    },
    CallExpression({ node }){
      const { callee } = node;
      if (node.arguments.length !== 1) 
        return;
      const { value } = node.arguments[0];
      if(!value) return;
      if (callee.name === "require") {
        const filepath = resolveModule(value);
        console.log(filepath);
        analyze(filepath);
        return;
      }
    }
  });
};

(async () => {
  const src = path.join(root, 'src');
  const out = path.join(root, 'dist');
  await start(src, out);

})();