const fs = require('fs-extra');
const postcss = require('postcss');

const wxss = (src, out, options = {}) => {
  const { plugins = [] } = options;
  const parser = postcss(plugins);
  return async (input, output) => {
    if(!fs.existsSync(input))
      return console.error('[@vxapp/wxss] file does not exists:', input);
    const source = await fs.readFile(input);
    const result = await parser.process(source);
    fs.writeFile(output, result.css);
  };
};

module.exports = wxss;