#!/usr/bin/env node
const babelOptions = {
  presets: [
    require('babel-preset-es2015'),
    require('babel-preset-stage-0')
  ]
};
require('babel-register')(babelOptions);

const fs 	    = require('fs');
const path    = require('path');
const glob    = require('glob');
const mkdir   = require('mkdirp');
const babel   = require('babel-core');
const postcss = require('postcss');

const cwd = process.cwd();
const src = path.join(cwd, 'src');
const out = path.join(cwd, 'build');

mkdir.sync(src);
mkdir.sync(out);

const noop = x => x;

function wxss(filename){
  const css = filename.replace(/\.js$/, '.css');
  const to  = css.replace(src, out).replace(/\.css$/, '.wxss');
  fs.readFile(css, (err, content) => {
    if(err) return;
    var paths = [
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

function wxml(filename){
  const html = filename.replace(/\.js$/, '.html');
  const wxml = filename.replace(/\.js$/, '.wxml').replace(src, out);
  mkdir.sync(path.dirname(wxml));
  fs.exists(html, (exists) => {
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

function findDeps(name, filename){
  var mod  = path.join(cwd, 'node_modules', name);
  var pkg  = require(path.join(mod, 'package.json'));
  var main = path.join(mod, pkg.main);
  var to   = path.join(out, 'scripts', name + '.js');
  mkdir.sync(path.dirname(to));
  transform(main, null, to);
  filename = filename.replace(src, out);
  return path.relative(path.dirname(filename), to);
}

function parseImport(code, filename){
  return code.replace(/import\s*(.*)from\s*["'](.+)["']/g, (match, name, file) => {
    var realPath = file;
    if(file.startsWith('.')){
      if(!file.endsWith('.js')) file += '.js';
      var to = path.resolve(path.dirname(filename), file);
      var from = to.replace(out, src);
      transform(from, null, to);
    }else{
      realPath = findDeps(file, filename);
    }
    return match.replace(file, realPath);
  });
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
    code = parseImport(code, to);
    var result = babel.transform(code, babelOptions);
    mkdir(path.dirname(to), err => {
      fs.writeFile(to, result.code, noop);
    });
  });
}

function run(){
  const app = path.join(src, 'app.js');
  glob(src + '/pages/**/*.js', (err, files) => {
    var pages = files.map(filename => {
      return filename.match(/(pages\/.*)\.js/)[1];
    });
    wxss(app);
    wxconfig(app, pages);
    transform(app, 'app');
    files.forEach(filename => {
      wxss(filename);
      wxml(filename);
      wxconfig(filename);
      transform(filename, 'page');
    });
  });
}

run();

fs.watch(src, { recursive: true }, run);