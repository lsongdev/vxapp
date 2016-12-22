import fs from 'fs'

const path   = require('path');
const glob   = require('glob');
const mkdir  = require('mkdirp');
const babel  = require('babel-core');

const cwd = process.cwd();
const src = path.join(cwd, 'src');
const out = path.join(cwd, 'build');

mkdir.sync(src);
mkdir.sync(out);

const babelOptions = {
  presets: [
    require('babel-preset-es2015'),
    require('babel-preset-stage-0')
  ]
};

const noop = x => x;
const app = path.join(src, 'app.js');
glob(src + '/pages/**/*.js', (err, files) => {
  var pages = files.map(filename => {
    return filename.match(/(pages\/.*)\.js/)[1];
  });
  wxconfig(app, pages);
  transform(app, 'app');
  files.forEach(filename => {
    wxml(filename);
    wxconfig(filename);
    transform(filename, 'page');
  });

});

function wxml(filename){
  const html = filename.replace(/\.js$/, '.html');
  const wxml = filename.replace(/\.js$/, '.wxml');
  const to = wxml.replace(src, out);
  mkdir.sync(path.dirname(to));
  fs.createReadStream(html).pipe(fs.createWriteStream(to));
}

function wxconfig(filename, pages){
  var Page = require(filename)[ 'default' ];
  if(typeof Page.config === 'object'){
    if(typeof pages === 'object') 
      Page.config.pages = pages;
    const json = filename.replace(/\.js$/, '.json').replace(src, out);
    fs.writeFile(json, JSON.stringify(Page.config), noop);
  }
}

function findDeps(name, filename){
  var mod = path.join(cwd, 'node_modules', name);
  var pkg = require(path.join(mod, 'package.json'));
  var file = path.join(mod, pkg.main);
  var to   = path.join(out, 'scripts', name + '.js');
  mkdir.sync(path.dirname(to));
  babel.transformFile(file, babelOptions, (err, res) => {
    fs.writeFile(to, res.code, noop);
  });
  filename = filename.replace(src, out);
  return './' + path.relative(path.dirname(filename), to);
}

function parseImport(code, filename){
  return code.replace(/import\s*(.*)from\s*["']([^;]*)["']/g, (match, name, path) => {
    return match.replace(path, findDeps(path, filename));
  });
}

function addRegister(code, type){
  var def = "import { $Run } from 'vxapp';\n";
  var run = "$Run(exports['default'], Page);";
  if(type === 'app') run = run.replace('Page', 'App');
  return def + code + run;
}

function transform(filename, type){
  fs.readFile(filename, 'utf8', (err, code) => {
    code = addRegister(code, type);
    code = parseImport(code, filename);
    var result = babel.transform(code, babelOptions);
    filename = filename.replace(src, out);
    mkdir(path.dirname(filename), err => {
      fs.writeFile(filename, result.code, noop);
    });
  });
  
}
