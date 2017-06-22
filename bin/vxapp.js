#!/usr/bin/env node
const babelOptions = {
  presets: [
    require('babel-preset-es2015'),
    require('babel-preset-stage-0')
  ]
};
require('babel-register')(babelOptions);

const fs      = require('fs');
const ncp     = require('ncp');
const path    = require('path');
const glob    = require('glob');
const mkdir   = require('mkdirp');
const babel   = require('babel-core');
const postcss = require('postcss');
const dedent  = require('dedent-js');
const program = require('commander');
const pkg     = require('../package');

require('upkg/updater')(pkg);

const cwd = process.cwd();
const src = path.join(cwd, 'src');
const out = path.join(cwd, 'build');
const noop = x => x;

mkdir.sync(src);
mkdir.sync(out);

program
.command('new <project_name>')
.description('create project')
.action(name => {
  name = path.join(cwd, name);
  console.log('> cd', name);
  mkdir(name);
  init(name);
})

program
.command('init')
.description('init exists project')
.action(x => init(cwd));

program
.command('build')
.description('build source code')
.action(x => run())

program
.version(pkg.version)
.option('-w, --watch', 'watching files change')
.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function init(dir){
  dir = dir || cwd;
  mkdir.sync(path.join(dir, 'src/pages/index'));

  // app.js
  fs.writeFile(path.join(dir, 'src/app.js'), dedent`
  import $ from 'vxapp';

  export default class extends $.App {
    // your code here
  }`, noop);

  // app.css
  fs.writeFile(path.join(dir, 'src/app.css'), dedent`
    /* global stylesheets here */
  `, noop);

  // pages/index/index.js
  fs.writeFile(path.join(dir, 'src/pages/index/index.js'), dedent`
  import $ from 'vxapp';

  export default class Index extends $.Page {
    onLoad(){
      this.setData({ name: 'vxapp' });
    }
  }`, noop);
  // pages/index/index.html
  fs.writeFile(path.join(dir, 'src/pages/index/index.html'), dedent`
    <view>hello {{name}}</view>
  `, noop);

  console.log('> npm i vxapp --save; vxapp build');
}


function wxss(filename){
  const to = filename
    .replace(src, out)
    .replace(/\.css$/, '.wxss');
  fs.readFile(filename, (err, content) => {
    if(err) return;
    const paths = [
      path.dirname(filename),
      path.join(src, 'pages')
    ];
    postcss([
      require('postcss-advanced-variables')(),
      require('postcss-partial-import')({ path: paths }),
      require('postcss-nested')
    ])
    .process(content)
    .then(result => {
      fs.writeFile(to, result.css, noop);
    })
  })
}

function wxml(html){
  const wxml = html
    .replace(src, out)
    .replace(/\.html$/, '.wxml')
  mkdir.sync(path.dirname(wxml));
  fs.exists(html, exists => {
    if(exists) fs.createReadStream(html).pipe(fs.createWriteStream(wxml));
  });
}

function wxconfig(filename, pages){
  const Page = require(filename)[ 'default' ];
  if(Page){
    const config = Page.config || {}; 
    if(typeof pages === 'object'){
      config.pages = pages;
    }
    const json = filename.replace(/\.js$/, '.json').replace(src, out);
    fs.writeFile(json, JSON.stringify(config), noop);
  }
}

function addImport(code, name, pkg){
  return `import ${name} from '${pkg}';\n` + code;
}

function addRegister(code, type){
  var run = "$Run(exports['default'], Page);";
  if(type === 'app') run = run.replace('Page', 'App');
  return addImport(code, '{ $Run }', 'vxapp') + run;
}

function transform(filename, type, to){
  fs.readFile(filename, 'utf8', (err, code) => {
    if(type === 'app' || type === 'page'){
      code = addRegister(code, type);
    }
    to = to || filename.replace(src, out);
    babelOptions.plugins = [ parseImport(filename) ];
    var result = babel.transform(code, babelOptions);
    mkdir(path.dirname(to), err => {
      fs.writeFile(to, result.code, noop);
    });
  });
}

function copy(){
  const img = path.join(src, 'images');
  ncp(img, img.replace(src, out));
}

function run(){
  const app = path.join(src, 'app');
  const pages = glob.sync(src + '/pages/**/!(_)*.js').map(filename => {
    return filename.match(/(pages\/.*)\.js/)[1];
  });

  copy();
  wxss(app + '.css');
  wxconfig(app + '.js', pages);
  transform(app + '.js', 'app');
  pages.forEach(page => {
    const filename = path.join(src, page);
    wxss(filename + '.css');
    wxml(filename + '.html');
    wxconfig(filename + '.js');
    transform(filename + '.js', 'page');
  });

  glob(src + '/pages/**/_*.*', (err, files) => {
    files.forEach(filename => {
      ;({
        html: wxml,
        css : wxss,
        js  : transform
      })[ filename.split('.').slice(-1)[0] ](filename)
    });
  });

}

if(program.watch){
   process.on('uncaughtException', function (err) {
    console.error('uncaught exception:', err.message);
  })
  fs.watch(src, { recursive: true }, run);
}


function parseImport (current){
  const resolve = name => {
    try{
      return require.resolve(name);
    }catch(e){};
  }
  const replaceWithAlias = (name) => {
    var filename = resolve(name);
    if(!filename) filename = path.resolve(path.dirname(current), name);
    var varname = path.basename(filename, '.js');
    if(/node_modules/.test(filename)) {
      varname = name;
      const to = path.join(out, 'scripts', varname) + '.js';
      mkdir.sync(path.dirname(filename));
      transform(filename, null, to);
      filename = to;
    }
    filename = filename.replace(src, out);
    return path.relative(path.dirname(current.replace(src, out)), filename);
  }
  return {
    visitor: {
      CallExpression: function CallExpression(path) {
        // require
        var node = path.node;
        if (node.callee.name === "require" && node.arguments.length === 1) {
          var filepath = node.arguments[0].value;
          if (!filepath) return;
          node.arguments[0].value = replaceWithAlias(filepath);
          return;
        }
        // require.resolve
        var callee = node.callee;
        if (!callee.object) return;
        if (!callee.property) return;
        if (node.arguments.length !== 1) return;
        if (!node.arguments[0].value) return;

        if (callee.object.name == 'require' && callee.property.name == 'resolve') {
          node.arguments[0].value = replaceWithAlias(node.arguments[0].value);
        }
      }
    }
  };
}
