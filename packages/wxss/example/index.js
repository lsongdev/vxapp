const wxss = require('..');

wxss.compile({
  current: __dirname + '/src/demo.wxss',
  source: __dirname + '/src',
  target: __dirname + '/dist'
});