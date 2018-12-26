
const compile = ast => {
  if(Array.isArray(ast)){
    return `[${ast.map(node => compile(node)).join(',\n')}]`;
  }
  if(ast.type === 'text'){
    return JSON.stringify(ast.value);
  }
  const h = 'createElement';
  const params = [
    JSON.stringify(ast.name),
    JSON.stringify(ast.attributes),
    ast.children.length ? compile(ast.children) : 'null'
  ];
  return `${h}(${params})`;
};

module.exports = ast => {
  const render = compile(ast);
  return `function render(){
    return ${render};
  }`;
};