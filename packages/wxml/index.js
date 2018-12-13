const fs = require('fs');
const xml = require('xml2');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

const wxml = async (filename, out) => {
  const source = await readFile(filename);
  xml.parse(source, obj => {
    console.log(obj);
  });
};

module.exports = wxml;