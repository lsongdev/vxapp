#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const build = require('../lib/build');
const create = require('../lib/create');
const program = require('../lib/program');
const devtools = require('../lib/devtools');

program()
.command('new', async ({ _: [ name ], ...options }) => {
  await create(name, options);
})
.command('build', async ({ _ }) => {
  const input = _[0] || 'src';
  const output = _[1] || 'dist';
  await build(input, output);
})
.command('login', async ({ print, force = true }) => {
  await devtools.requireLogin({ print, force });
})
.command('preview', async ({ _, path: startPath, print }) => {
  await devtools.requireLogin();
  const project = _[0] || './dist';
  const package = devtools.pack(project);
  const result = await devtools.preview(package, startPath);
  const { errcode, errmsg } = result.baseresponse;
  console.log('[@vxapp/cli] preview:', errmsg);
  if(errcode !== 0) return;
  const qrcode = Buffer.from(result.qrcode_img, 'base64');
  const filename = typeof print === 'string' ?
    print : path.join('/tmp', `vxapp-${Date.now()}-${Math.random()}.png`);
  fs.writeFile(filename, qrcode, err => {
    if(err) return console.log('[@vxapp/cli] preview:', err.message);
    if(print){
      console.log('[@vxapp/cli] preview:', filename);
    }else{
      const { exec } = require('child_process');
      exec(`open ${filename}`);
    }
  });
})
.command('publish', async ({ _, version, message }) => {
  await devtools.requireLogin();
  const project = _[0] || './dist';
  const package = devtools.pack(project);
  const result = await devtools.publish(package, version, message);
  const { errcode, errmsg } = result.baseresponse;
  console.log('[@vxapp/cli] publish:', errmsg);
  if(errcode === 0){
    console.log('[@vxapp/cli] package size:', result.wxpkg_size);
  }else{
    console.log('[@vxapp/cli] publish:', result.compile_err_msg);
  }
})
.command('pack', async ({ _, filename }) => {
  const project = _[0] || './dist';
  await devtools.pack(project, filename);
})
.command('unpack', async ({ _, filename, output }) => {
  filename = filename || _[0];
  output = output || _[1];
  await devtools.unpack(filename, output);
})
.command('qrcode', async ({ type = 'A', ...options }) => {
  const qrcode = await devtools.qrcode(type, options);
  console.log('create qrcode:', qrcode);
})
.command('help', () => {
  console.log();
  console.log('~$ vxapp <command> [options]');
  console.log();
  console.log(' - new');
  console.log(' - build');
  console.log(' - pack');
  console.log(' - unpack');
  console.log(' - login');
  console.log(' - preview');
  console.log(' - publish');
  console.log(' - qrcode');
  console.log(' - version');
  console.log(' - help');
})
.command('version', () => {
  const pkg = require('../package.json');
  console.log(pkg.version);
})
.parse();