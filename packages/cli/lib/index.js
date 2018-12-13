const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const babylon = require('@babel/parser');
const traverse = require('@babel/traverse').default;


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