const fs = require('fs');
const xml = require('xml2');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

module.exports = (src, out, options) => {
  return async (input, output) => {
    const transform = ast => {
      return {
        import(node){
          node.attributes.src = path.resolve(node.attributes.src);
        }
      }
    }
    const result = await xml.transformFile(input, {
      plugins: [ transform ]
    });
    console.log(result);
  };
};