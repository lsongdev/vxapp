const wxml = require('..');

wxml.compile({
  current: __dirname + '/src/demo.wxml',
  source: __dirname + '/src',
  target: __dirname + '/dist'
});