const wxml = require('..');

(async () => {
  const fn = await wxml.compile(__dirname + '/src/demo.wxml', {
    
  });

  console.log(fn);
})();