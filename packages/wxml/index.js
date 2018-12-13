const fs = require('fs-extra');
const xml = require('xml2');
const path = require('path');

module.exports = (src, out, options) => {
  return async (input, output) => {
    if(!await fs.exists(input))
      return console.error('[@vxapp/wxml] file does not exists:', input);
    const source = await fs.readFile(input);
    xml.parse(source, obj => {
      console.log(obj);
    });
  };
};